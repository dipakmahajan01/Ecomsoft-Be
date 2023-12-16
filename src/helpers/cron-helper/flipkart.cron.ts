/* eslint-disable no-console */

import cron from 'node-cron';
import { orderApiDataInsert } from '../flpkart-provider/flipakart-data';

export const orderApiCron = () => {
  cron.schedule('*/3 * * * *', async () => {
    console.log('cron :>> ', 'cron running');
    await orderApiDataInsert();
  });
};
