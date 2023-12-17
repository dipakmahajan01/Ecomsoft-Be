/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import { FLIPKART, FLIPKART_SERVICE_PROFILE, FLIPKART_STATUS, STATUS } from '../common/global-constants';
import order, { IOrder } from '../model/order.model';
import UserCredential from '../model/user_credential.model';
import { generatePublicId, setTimesTamp } from '../common/common-function';
import RateCard from '../model/rateCard.model';
import { calculateCommission, fetchAndCacheIfNeeded } from './common_helper';

const generateToken = async (apiKey: string, secret: string) => {
  try {
    let base64Credentials = btoa(`${apiKey}:${secret}`);
    const config = {
      method: 'get', // Change the HTTP method as needed (e.g., 'post', 'put', 'delete', etc.)
      url: FLIPKART.GENERATE_TOKEN_API,
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json', // Adjust the content type if necessary
      },
    };
    const { data } = await axios(config);
    if (!data && !data.data.access_token) {
      throw new Error(`Token not found in response for apiKet:- ${apiKey} secret:- ${secret}`);
    }
    return data.access_token;
  } catch (error: any) {
    console.log(error);
    if (!axios.isAxiosError(error)) {
      throw new Error(`Something went wrong... Please check. Message:- ${error.message}  errorCode: ${error.name}`);
    }

    const { error: errorCode, error_description: errorDescription } = error.response?.data ?? {};
    throw new Error(
      `Something is off in API or seller Credentials... Please check. Message:- ${
        errorDescription ?? error.message
      }  errorCode: ${errorCode ?? error.name}`,
    );
  }
};

const extractOrderData = (order: any) => {
  console.log('Order id', order.orderItemId);
  console.log('quantity', order.quantity);
  console.log('is_replacement', order.is_replacement);
  return {
    order_item_id: order.orderItemId,
    flipkart_order_id: order.orderId,
    Hsn_code: order.hsn,
    fsn_code: order.fsn,
    cancellationReason: order.cancellationReason,
    cancellationSubReason: order.cancellationSubReason,
    serviceProfile: order.serviceProfile,
    courierReturn: order.courierReturn,
    flipkart_status: order.status,
    order_date: order.orderDate,
    sku: order.sku,
    priceComponents: order.priceComponents,
    quantity: order.quantity,
    paymentType: order.paymentType,
    cancellationDate: order?.cancellationDate ?? null,
  };
};

const extractOrderItemsFromShipment = (shipment) => {
  return shipment.map((shipment) => shipment.orderItems).flat();
};

const extractCancelOrderData = (shipments): IOrder[] => {
  const orderItemData = extractOrderItemsFromShipment(shipments);
  return orderItemData.map(extractOrderData);
};

export const getCancelOrders = async ({
  apiKey,
  secret,
  axiosConfig,
}: {
  apiKey: string;
  secret: string;
  axiosConfig: AxiosRequestConfig;
}) => {
  let orderList = [];
  try {
    if (!axiosConfig.headers?.Authorization) {
      const token = await generateToken(apiKey, secret);
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }

    const { data } = await axios(axiosConfig);
    const { hasMore, nextPageUrl, shipments } = data;
    // const orders = extractCancelOrderData(shipments);
    orderList = shipments;
    if (!hasMore) {
      return orderList;
    }

    const newAxiosConfig = {
      ...axiosConfig,
      method: 'GET',
      url: `${FLIPKART.FLIPKART_BASE_URL}/sellers${nextPageUrl}`,
      data: null,
    };
    const newOrderList = await getCancelOrders({ apiKey, secret, axiosConfig: newAxiosConfig });
    return [...orderList, ...newOrderList];
  } catch (error: any) {
    console.log('Need to handle the error here........', error?.response?.data ?? error.message);
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const errorCode = error.response.data?.error;
    if (errorCode === 'unauthorized' || errorCode === 'invalid_token') {
      delete axiosConfig.headers.Authorization;
      const newOrderList = await getCancelOrders({ apiKey, secret, axiosConfig });
      return [...orderList, ...newOrderList];
    }
    throw error;
  }
};

const getBodyData = ({ from, to }: { from: string; to: string }) => {
  return {
    filter: {
      type: 'cancelled',
      states: ['cancelled'],
      orderDate: {
        from,
        to,
      },
      cancellationDate: {
        from,
        to,
      },
      cancellationType: 'sellerCancellation',
    },
    pagination: {
      pageSize: 20,
    },
  };
};

const updateAuthorAndTimeStamp = (author: string, doc: any) => {
  doc.created_by = author;
  doc.updated_by = author;
  doc.created_at = setTimesTamp();
  doc.updated_at = setTimesTamp();
  doc.order_id = generatePublicId();
};

export const handleInsertCancelOrder = async () => {
  try {
    const flipkartAccount = await UserCredential.find({
      user_id: '75336827-f95e-4fb5-b4a9-ea7d9b6e957f',
      is_deleted: false,
    });
    // const today = formatDateToYYYYMMDD(getToday());
    // const tomorrow = formatDateToYYYYMMDD(getTomorrow());
    const cachedRateCardDocs = new Map();
    for (let account of flipkartAccount) {
      try {
        const axiosConfig = {
          method: 'POST',
          url: FLIPKART.ORDER_API,
          data: getBodyData({ from: '2023-04-01', to: '2023-12-30' }),
          headers: {},
        };
        console.log('Cancel order started');
        const shipmentsData = await getCancelOrders({
          apiKey: account.api_key,
          secret: account.secret,
          axiosConfig,
        });

        console.log('shipments data', shipmentsData);
        const orderData = extractCancelOrderData(shipmentsData);

        for (let doc of orderData) {
          if (doc.cancellationReason === FLIPKART_STATUS.SELLER_CANCELLATION) {
            const rateCardData = await fetchAndCacheIfNeeded(cachedRateCardDocs, doc.fsn_code);

            if (rateCardData) {
              const serverProfile =
                doc.serviceProfile === FLIPKART_SERVICE_PROFILE.SELLER_FULFILMENT
                  ? FLIPKART_SERVICE_PROFILE.NON_FBF
                  : FLIPKART_SERVICE_PROFILE.FBF;

              const customerPrice = doc.priceComponents.sellingPrice;
              const commissionTable = rateCardData.commission[serverProfile];
              const commission = calculateCommission(customerPrice, commissionTable);
              doc.commission = commission;
              // Need to calculate base on pre ready to dispatch and post ready to dispatch.
              doc.net_profit = -commission;
              doc.status = STATUS.CANCELLED;
            }
          }
          updateAuthorAndTimeStamp(account.user_id, doc);
        }
        debugger;
        console.log(orderData.length);
        const doc = await order.insertMany(orderData);
      } catch (error) {
        console.log(`Error while processing account. API_KEY - ${account.api_key} SECRET - ${account.secret}`);
      }
    }
  } catch (error) {
    console.log('error in cancel order cron job........', error);
  }
};
