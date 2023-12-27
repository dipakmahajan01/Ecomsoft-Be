/* eslint-disable no-console */

import cron from 'node-cron';
import { handleInsertCancelOrder } from '../../services/cancel.order';
import { handlerTodaysOrders } from '../../services/get.today.orders';

// export const orderApiCron = () => {
//   cron.schedule('*/3 * * * *', async () => {
//     console.log('---------------', 'order cron job runing-------------------');
//     await orderApiDataInsert();
//   });
// };

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('---------------', ' cancel order cron job running-------------------');
    await handleInsertCancelOrder();
  });
};

export const todaysOrders = () => {
  cron.schedule('* * * * *', async () => {
    console.log('---------------', 'today order cron job running-------------------');
    await handlerTodaysOrders();
  });
};
