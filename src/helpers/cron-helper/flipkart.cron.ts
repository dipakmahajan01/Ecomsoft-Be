/* eslint-disable no-console */

import cron from 'node-cron';
import { FLIPKART } from '../../common/global-constants';
import UserCredential from '../../model/user_credential.model';
import { getCancelOrders, handleInsertCancelOrder } from '../../services/cancel.order';

export const orderApiCron = () => {
  cron.schedule('* * * * *', () => {
    console.log('cron :>> ', 'cron running');
  });
};

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', handleInsertCancelOrder);
};
