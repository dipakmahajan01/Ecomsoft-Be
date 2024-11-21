/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import { FLIPKART } from '../common/global-constants';
import { sliceIntoBatches } from './helpers';
import { logsError } from '../lib';

const FLIPKART_MAX_ORDER_GET_LIMIT = 25;

const extractReturnOrders = (data) => {
  const res = {};
  data?.returnItems.forEach((order) => {
    const orderITem = {
      status: order.type,
      return_order_status: order.status,
      return_order_reason: order.reason,
      return_order_sub_reason: order.subReason,
      return_order_shipment_status: order.shipmentStatus,
      return_order_shipment_id: order.shipmentId,
      serviceProfile: order.serviceProfile,
    };
    res[order.orderItemId] = orderITem;
  });
  return res;
};

export const getReturnOrders = async ({ orderIDs, token }: { orderIDs: string[]; token: string }) => {
  let result = {};
  try {
    let accessToken = token;
    const orderArrayBatch = sliceIntoBatches(orderIDs, FLIPKART_MAX_ORDER_GET_LIMIT);

    for (let ordersArray of orderArrayBatch) {
      const reqConfig: AxiosRequestConfig = {
        method: 'GET',
        url: `${FLIPKART.RETURN_ORDER_API}?returnIds=${ordersArray.toString()}`,
        data: null,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const { data: returnOrders = [] } = await axios(reqConfig);
      const orderData = extractReturnOrders(returnOrders);
      result = { ...result, ...orderData };
    }
    return result;
  } catch (error: any) {
    logsError(error, error?.response?.data);
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const errorCode = error.response?.data?.error;
    if (errorCode === 'unauthorized' || errorCode === 'invalid_token') {
      const ordersData = await getReturnOrders({ orderIDs, token: null });
      return { ...result, ...ordersData };
    }
    throw error;
  }
};
