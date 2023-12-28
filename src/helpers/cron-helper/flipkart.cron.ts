/* eslint-disable no-console */

import cron from 'node-cron';
import { handleInsertCancelOrder } from '../../services/cancel.order';
import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';
import { handlerTodaysOrders } from '../../services/get.today.orders';
import { handleOrderStatusCheck } from '../../services/check.order.status';

export const orderApiCron = () => {
  cron.schedule('*/3 * * * *', async () => {
    await orderApiDataInsert();
  });
};

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', async () => {
    await handleInsertCancelOrder();
  });
};

export const todaysOrders = () => {
  cron.schedule('* * * * *', handlerTodaysOrders);
};

export const serverDayOrdersStatusUpdate = () => {
  cron.schedule('* * * * *', () => {
    console.log('serverDayOrdersStatusUpdate cron running');
    handleOrderStatusCheck();
  });
};
