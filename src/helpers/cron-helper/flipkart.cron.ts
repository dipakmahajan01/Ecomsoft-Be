/* eslint-disable no-console */

import cron from 'node-cron';

export const orderApiCron = () => {
  cron.schedule('* * * * *', () => {
    console.log('cron :>> ', 'cron running');
  });
};
