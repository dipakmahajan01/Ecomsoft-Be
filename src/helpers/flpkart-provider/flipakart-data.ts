/* eslint-disable no-console */

import { generatePublicId, setTimesTamp } from '../../common/common-function';
import { FLIPKART } from '../../common/global-constants';
import { fetchShipments, orderStatusCheckApi } from '../../services/flipkart';
import order from '../../model/order.model';
// eslint-disable-next-line
export const orderApiDataInsert = async () => {
  try {
    const config = {
      method: 'POST',
      url: FLIPKART.ORDER_API,
      data: {
        filter: {
          type: 'postDispatch',
          states: ['DELIVERED'],
          orderDate: {
            from: '2023-09-14',
            to: '2023-12-14',
          },
        },
      },
    };
    const { data } = await fetchShipments(config);
    // console.log('data', data);
    let orderArr = [];
    let orderArrInsertData = [];
    for (const orderData of data) {
      orderArr.push(...orderData.orderItems);
    }
    for (const data of orderArr) {
      const orderData = await order.findOne({ order_item_id: data.orderItemId });
      if (!orderData) {
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
        orderArrInsertData.push(setOrder);
      }
    }
    await order.insertMany(orderArrInsertData);
    await orderStatusCheckApi();
  } catch (error) {
    return error;
  }
};
