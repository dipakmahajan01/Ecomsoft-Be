/* eslint-disable no-console */

import { generatePublicId, getEndOfDay, getStartOfDay, setTimesTamp } from '../../common/common-function';
import { FLIPKART } from '../../common/global-constants';
import { fetchShipments } from '../../services/flipkart';
import order from '../../model/order.model';
// eslint-disable-next-line
export const orderApiDataInsert = async () => {
  const from = getStartOfDay(new Date(2023, 8, 13)).toISOString();
  const to = getEndOfDay(new Date(2023, 8, 13)).toISOString();

  try {
    const config = {
      method: 'POST',
      url: FLIPKART.ORDER_API,
      data: {
        filter: {
          type: 'postDispatch',
          states: ['DELIVERED'],
          orderDate: {
            from,
            to,
          },
        },
      },
    };
    const { data } = await fetchShipments(config);
    // console.log('data', data);
    let orderArr = [];
    let orderArrInsertData = {};
    const orderIdsArray = [];
    for (const orderData of data) {
      orderArr.push(...orderData.orderItems);
    }
    for (const data of orderArr) {
      orderIdsArray.push(data.orderItemId);
      const setOrder = {
        order_id: generatePublicId(),
        order_item_id: data.orderItemId,
        flipkart_order_id: data.orderId,
        Hsn_code: data.hsn,
        status: data.status,
        sku: data.sku,
        priceComponents: data.priceComponents,
        quantity: data.quantity,
        paymentType: data.paymentType,
        cancellationDate: data.cancellationDate,
        created_at: setTimesTamp(),
      };

      orderArrInsertData[data.orderItemId] = setOrder;
    }
    // Fetch Shipment type;
    // const ordersShipmentType = getShipmentsType({ orderIDs: orderIdsArray, apiKey:})

    // Calculations

    return await order.insertMany(orderArrInsertData);
  } catch (error) {
    return error;
  }
};
