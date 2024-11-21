import cron from 'node-cron';
// // import { handleInsertCancelOrder } from '../../services/cancel.order';
// // import { handlerTodaysOrders } from '../../services/get.today.orders';
// // import { handleOrderStatusCheck } from '../../services/check.order.status';
import { logInfo } from '../../lib';
import { createIssueOrder } from '../../services/messoIssueOrder';

// // export const orderApiCron = () => {
// //   cron.schedule('* * * * *', async () => {
// //     console.log('---------------', 'order cron job runing-------------------');
// //     await orderApiDataInsert();
// //   });
// // };
// export const todaysOrders = () => {
//   cron.schedule('* * * * *', async () => {
//     logInfo('---------------', 'today order cron job running-------------------');
//     await handlerTodaysOrders();
//   });
// };

// export const cancelOrderApiCron = () => {
//   cron.schedule('* * * * *', async () => {
//     await handleInsertCancelOrder();
//   });
// };

// export const serverDayOrdersStatusUpdate = () => {
//   cron.schedule('* * * * *', async () => {
//     logInfo('---------------', '7 today order status cron job running-------------------');
//     await handleOrderStatusCheck();
//   });
// };
export const createIssueOrderCron = async () => {
  cron.schedule('0 0 * * *', async () => {
    logInfo('---------------', 'today order cron job running-------------------');
    await createIssueOrder();
  });
};
