import { convertIntoUnix, generatePublicId, setTimesTamp } from '../common/common-function';
import { FLIPKART, FLIPKART_SERVICE_PROFILE, STATUS } from '../common/global-constants';
import { logInfo, logsError } from '../lib';
import order from '../model/order.model';
import UserCredential from '../model/user_credential.model';
import { getOrders } from './get.orders';
import {
  calculateCollectionFee,
  calculateCommission,
  calculateFixedFees,
  calculateShippingFees,
  extractOrders,
  fetchAndCacheIfNeeded,
  modifyAuthorAndTimeStamp,
} from './helpers';
import { getShipmentsType } from './shipmentType.order';

const getBodyData = ({ from, to }: { from: string; to: string }) => {
  return {
    filter: {
      type: 'postDispatch',
      states: ['DELIVERED'],
      orderDate: {
        from,
        to,
      },
    },
    pagination: {
      pageSize: 20,
    },
  };
};

export const handlerTodaysOrders = async () => {
  let currentAccount = null;
  let currentDoc = null;
  try {
    const flipkartAccount = await UserCredential.find({
      user_id: '75336827-f95e-4fb5-b4a9-ea7d9b6e957f', // TODO - Remove this.
      is_deleted: false,
    });
    // const today = formatDateToYYYYMMDD(getToday()); // TODO - Use ISO string. helper function are in global-function use them.
    // const tomorrow = formatDateToYYYYMMDD(getTomorrow());
    const cachedRateCardDocs = new Map();
    for (let account of flipkartAccount) {
      currentAccount = account._id;
      const axiosConfig = {
        method: 'POST',
        url: FLIPKART.ORDER_API,
        data: getBodyData({ from: '2023-09-01', to: '2023-12-30' }),
        headers: {},
      };
      const { orderList: shipmentsData, accessToken } = await getOrders({
        apiKey: account.api_key,
        secret: account.secret,
        axiosConfig,
        token: account.auth_token,
      });
      // console.log('shipmentsDataIds', shipmentsData.map((order) => order.order_item_id))
      // console.log('shipmentsData', shipmentsData.length)
      let orderData = extractOrders(shipmentsData);
      // console.log('shipmentsData', orderData)
      const orderIds = orderData.map((order) => order.order_item_id);
      // console.log('orderIds', orderIds)
      const orderShipmentType = await getShipmentsType({
        orderIDs: orderIds,
        apiKey: account.api_key,
        secret: account.secret,
        token: accessToken,
      });
      // Merge order and shipment type data
      orderData = orderData.map((order) => {
        return {
          ...order,
          ...orderShipmentType[order.order_item_id],
        };
      });
      const orderDatas = [];
      for (let doc of orderData) {
        currentDoc = doc.order_item_id;
        const rateCardData = await fetchAndCacheIfNeeded(cachedRateCardDocs, doc.fsn_code); // TODO - Need to fetch all fsn_code at once for performance.
        if (!rateCardData) {
          logInfo(`Rate card data not found FSN Code:- ${doc.fsn_code} `);
        }
        if (rateCardData) {
          const serverProfile =
            doc.serviceProfile === FLIPKART_SERVICE_PROFILE.SELLER_FULFILMENT
              ? FLIPKART_SERVICE_PROFILE.NON_FBF
              : FLIPKART_SERVICE_PROFILE.FBF;

          const customerPrice = doc.priceComponents.sellingPrice;
          const commissionTable = rateCardData.commission[serverProfile];
          const shipmentFeesTable = rateCardData.shipping_fee[serverProfile][account.badge];
          const fixedFeesTable = rateCardData.fixed_fees[serverProfile];
          const reverseShippingFeesTable = rateCardData.reverse_shipping_fee[serverProfile];
          const collectionFeesTable = rateCardData.collection_fees;

          const commission = calculateCommission(customerPrice, commissionTable);
          const shipmentFee = calculateShippingFees({
            weight: doc.totalWeight,
            shipmentFeesTable,
            shipmentType: doc.shipmentType,
          });
          const fixedFee = calculateFixedFees(customerPrice, fixedFeesTable);
          const reverseShippingFee = calculateShippingFees({
            weight: doc.totalWeight,
            shipmentFeesTable: reverseShippingFeesTable,
            shipmentType: doc.shipmentType,
          });
          const collectionFee = calculateCollectionFee({
            customerPrice,
            collectionFeesTable,
            paymentType: doc.paymentType,
          });

          doc.commission = commission;
          doc.shippingFee = shipmentFee;
          doc.fixedFee = fixedFee;
          doc.reverseShippingFee = reverseShippingFee;
          doc.collectionFee = collectionFee;
          doc.status = STATUS.ON_GOING;
        }
        modifyAuthorAndTimeStamp(account.user_id, doc);

        orderDatas.push(doc);
        const orders = await order.findOne({ flipkart_order_id: doc.flipkart_order_id });

        if (!orders) {
          await order.create({
            ...doc,
            order_id: generatePublicId(),
            order_item_id: doc.order_item_id,
            flipkart_order_id: doc.flipkart_order_id,
            Hsn_code: doc.Hsn_code,
            fsn_code: doc.fsn_code,
            flipkart_status: doc.flipkart_status,
            order_date: convertIntoUnix(doc.order_date),
            sku: doc.sku,
            priceComponents: doc.priceComponents,
            quantity: doc.quantity,
            paymentType: doc.paymentType,
            cancellationDate: doc.cancellationDate,
            serviceProfile: doc.serviceProfile,
            commission: doc.commission,
            shippingFee: doc.shippingFee,
            fixedFee: doc.fixedFee,
            reverseShippingFee: doc.reverseShippingFee,
            collectionFee: doc.collectionFee,
            net_profit: doc.net_profit,
            created_at: setTimesTamp(),
          });
        }
      }
    }

    return null;
  } catch (error) {
    logsError(error, { currentAccount, currentDoc });
    return null;
  }
};

// TODO :- Names of file and file organization needs to refactor only related to services folder.
// TODO :- Create order status check
