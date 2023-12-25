/* eslint-disable no-console */

import cron from 'node-cron';
import { handleInsertCancelOrder } from '../../services/cancel.order';
import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';
import { handlerTodaysOrders } from '../../services/get.today.orders';

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
