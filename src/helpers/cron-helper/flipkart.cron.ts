/* eslint-disable no-console */

import cron from 'node-cron';
import { handleInsertCancelOrder } from '../../services/cancel.order';
import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';

export const orderApiCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('cron :>> ', 'cron running');
    await orderApiDataInsert();
  });
};

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', async () => {
    await handleInsertCancelOrder();
  });
};
