/* eslint-disable no-console */

import cron from 'node-cron';
import { FLIPKART } from '../../common/global-constants';
import { getCancelOrders } from '../../services/flipkart';
import UserCredential from '../../model/user_credential.model';

export const orderApiCron = () => {
  cron.schedule('* * * * *', () => {
    console.log('cron :>> ', 'cron running');
  });
};

const d = {
  filter: {
    type: 'postDispatch',
    states: ['DELIVERED'],
    orderDate: {
      from: '2023-09-06',
      to: '2023-09-23',
    },
    cancellationDate: {
      from: '2023-11-07',
      to: '2023-11-23',
    },
    cancellationType: 'sellerCancellation',
  },
  pagination: {
    pageSize: 20,
  },
};

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const flipkartAccount = await UserCredential.find({ is_deleted: false });
      for (let account of flipkartAccount) {
        const cancelShipments = [];
        const axiosConfig = {
          method: 'POST',
          url: FLIPKART.ORDER_API,
          data: d,
          headers: {},
        };
        const sellerAuth = { ...account };
        console.log('Cancel order started');
        const returnData = await getCancelOrders(sellerAuth, axiosConfig, cancelShipments);
        console.log(returnData);
      }
      console.log('cron :>> ', 'cron running');
    } catch (error) {
      console.log('error in cancel order cron job........', error);
    }
  });
};
