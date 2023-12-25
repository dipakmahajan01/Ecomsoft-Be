/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import { FLIPKART } from '../common/global-constants';
import { generateToken, sliceIntoBatches } from './helpers';

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

export const getReturnOrders = async ({
  orderIDs,
  token,
  apiKey,
  secret,
}: {
  orderIDs: string[];
  token: string;
  apiKey: string;
  secret: string;
}) => {
  let result = {};
  try {
    let accessToken = token;

    if (!accessToken) {
      accessToken = await generateToken(apiKey, secret);
      if (!accessToken) return result;
    }

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
    console.log('Need to handle the error here........', error?.response?.data ?? error.message);
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const errorCode = error.response.data?.error;
    if (errorCode === 'unauthorized' || errorCode === 'invalid_token') {
      const ordersData = await getReturnOrders({ apiKey, secret, orderIDs, token: null });
      return { ...result, ...ordersData };
    }
    throw error;
  }
};
