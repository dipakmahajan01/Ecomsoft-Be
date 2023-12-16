/* eslint-disable no-console */

import cron from 'node-cron';
import { fetchShipments } from '../../services/flipkart';
import { handleInsertCancelOrder } from '../../services/cancel.order';

export const orderApiCron = () => {
  cron.schedule('*/2 * * * *', async () => {
    console.log('cron :>> ', 'cron running');
    const config = {
      method: 'POST',
      url: `https://api.flipkart.net/sellers/v3/shipments/filter`,

      data: {
        filter: {
          type: 'postDispatch',
          states: ['DELIVERED'],
          orderDate: {
            from: '2023-9-15',
            to: '2023-9-30',
          },
        },
      },
    };
    await fetchShipments(config);
  });
};

export const cancelOrderApiCron = () => {
  cron.schedule('* * * * *', handleInsertCancelOrder);
};
