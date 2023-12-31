/* eslint-disable no-console */

import cron from 'node-cron';
import { handleInsertCancelOrder } from '../../services/cancel.order';
// import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';
import { handlerTodaysOrders } from '../../services/get.today.orders';
import { handleOrderStatusCheck } from '../../services/check.order.status';
// import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';

// export const orderApiCron = () => {
//   cron.schedule('* * * * *', async () => {
//     console.log('---------------', 'order cron job runing-------------------');
//     await orderApiDataInsert();
//   });
// };
export const todaysOrders = () => {
  cron.schedule('* * * * *', async () => {
    console.log('---------------', 'today order cron job running-------------------');
    await handlerTodaysOrders();
  });
};

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', async () => {
    await handleInsertCancelOrder();
  });
};

export const serverDayOrdersStatusUpdate = () => {
  cron.schedule('* * * * *', async () => {
    console.log('---------------', '7 today order status cron job running-------------------');
    await handleOrderStatusCheck();
  });
};
