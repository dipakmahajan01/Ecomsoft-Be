/* eslint-disable no-console */

import cron from 'node-cron';
import { handleInsertCancelOrder } from '../../services/cancel.order';
import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';
import { test } from '../../services';

export const orderApiCron = () => {
  cron.schedule('*/3 * * * *', async () => {
    console.log('cron :>> ', 'cron running');
    await orderApiDataInsert();
  });
};

export const cancelOrderApiCron = () => {
  console.log('Cron setup for cancel order');
  cron.schedule('* * * * *', test);
};
