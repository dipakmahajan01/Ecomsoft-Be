// /* eslint-disable no-console */
// import { FLIPKART, FLIPKART_SERVICE_PROFILE, FLIPKART_STATUS, STATUS } from '../common/global-constants';
// import order from '../model/order.model';
// import UserCredential from '../model/user_credential.model';
// import { calculateCommission, extractOrders, fetchAndCacheIfNeeded, modifyAuthorAndTimeStamp } from './helpers';
// import { getOrders } from './get.orders';
// import { logsError } from '../lib';

// const getBodyData = ({ from, to }: { from: string; to: string }) => {
//   return {
//     filter: {
//       type: 'cancelled',
//       states: ['cancelled'],
//       orderDate: {
//         from,
//         to,
//       },
//       cancellationDate: {
//         from,
//         to,
//       },
//       cancellationType: 'sellerCancellation',
//     },
//     pagination: {
//       pageSize: 20,
//     },
//   };
// };

// export const handleInsertCancelOrder = async () => {
//   try {
//     const flipkartAccount = await UserCredential.find({
//       user_id: '0b0a540e-5779-4352-bdca-6d64fec4f6b7', // TODO - Remove this.
//       is_deleted: false,
//     });
//     // const today = formatDateToYYYYMMDD(getToday()); // TODO - Use ISO string. helper function are in global-function use them.
//     // const tomorrow = formatDateToYYYYMMDD(getTomorrow());
//     const cachedRateCardDocs = new Map();
//     for (let account of flipkartAccount) {
//       try {
//         const axiosConfig = {
//           method: 'POST',
//           url: FLIPKART.ORDER_API,
//           data: getBodyData({ from: '2023-04-01', to: '2023-12-30' }),
//           headers: {},
//         };
//         const { orderList: shipmentsData } = await getOrders({
//           axiosConfig,
//           token: account.access_token,
//         });

//         const orderData = extractOrders(shipmentsData);

//         for (let doc of orderData) {
//           if (doc.cancellationReason === FLIPKART_STATUS.SELLER_CANCELLATION) {
//             const rateCardData = await fetchAndCacheIfNeeded(cachedRateCardDocs, doc.fsn_code); // TODO - Need to fetch all fsn_code at once for performance.

//             if (rateCardData) {
//               const serverProfile =
//                 doc.serviceProfile === FLIPKART_SERVICE_PROFILE.SELLER_FULFILMENT
//                   ? FLIPKART_SERVICE_PROFILE.NON_FBF
//                   : FLIPKART_SERVICE_PROFILE.FBF;

//               const customerPrice = doc.priceComponents.sellingPrice;
//               const commissionTable = rateCardData.commission[serverProfile];
//               const commission = calculateCommission(customerPrice, commissionTable);
//               doc.commission = commission;
//               // Need to calculate base on pre ready to dispatch and post ready to dispatch.
//               doc.net_profit = -commission;
//               doc.status = STATUS.CANCELLED;
//             }
//           }
//           modifyAuthorAndTimeStamp(account.user_id, doc);
//         }
//         return await order.insertMany(orderData);
//       } catch (error) {
//         logsError(error, `Error while processing account. API_KEY - ${account.api_key} SECRET - ${account.secret}`);
//       }
//     }

//     return null;
//   } catch (error) {
//     logsError(error, 'error in cancel order cron job........');
//     return null;
//   }
// };
