/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import { FLIPKART } from '../common/global-constants';
import {
  extractOrderData,
  extractOrderItemsFromShipment,
  extractOrderWeightInfo,
  generateToken,
  sliceIntoBatches,
} from './helpers';
import { logsError } from '../lib';

const FLIPKART_MAX_SHIPMENT_GET_LIMIT = 100;

const extractOrdersFromShipment = (shipments) => {
  const result = {};
  const orderItems = extractOrderItemsFromShipment(shipments);
  const packageInfo = extractOrderWeightInfo(shipments);
  orderItems.forEach((order) => {
    const extracted = extractOrderData(order, packageInfo);
    result[order.orderItemId] = extracted;
  });

  return result;
};

export const getOrdersByIds = async ({
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
  let result = [];
  try {
    let accessToken = token;

    if (!accessToken) {
      accessToken = await generateToken(apiKey, secret);
      if (!accessToken) return result;
    }

    const shipmentArrayBatch = sliceIntoBatches(orderIDs, FLIPKART_MAX_SHIPMENT_GET_LIMIT);

    for (let shipmentArray of shipmentArrayBatch) {
      const reqConfig: AxiosRequestConfig = {
        method: 'GET',
        url: `${FLIPKART.GET_SHIPMENT_V3}??orderItemIds={}=${shipmentArray.toString()}`,
        data: null,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const { data: shipmentsData = [] } = await axios(reqConfig);
      const extractedShipment = extractOrdersFromShipment(shipmentsData);
      result = { ...result, ...extractedShipment };
    }
    return result;
  } catch (error: any) {
    console.log('Need to handle the error here........', error?.response?.data ?? error.message);
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const errorCode = error.response.data?.error;
    if (errorCode === 'unauthorized' || errorCode === 'invalid_token') {
      const shipmentData = await getOrdersByIds({ apiKey, secret, orderIDs, token: null });
      return { ...result, ...shipmentData };
    }
    throw error;
  }
};

export const getOrders = async ({
  apiKey,
  secret,
  axiosConfig,
  token,
}: {
  apiKey: string;
  secret: string;
  axiosConfig: AxiosRequestConfig;
  token: string;
}) => {
  let orderList = [];
  let accessToken = token;
  let reqConfig = { ...axiosConfig };
  try {
    if (!accessToken) {
      accessToken = await generateToken(apiKey, secret);
      if (!accessToken) return orderList;
    }
    reqConfig.headers.Authorization = `Bearer ${accessToken}`;

    const { data } = await axios(reqConfig);
    const { hasMore, nextPageUrl, shipments } = data;
    // const orders = extractCancelOrderData(shipments);
    orderList = shipments;
    if (!hasMore) {
      return { orderList, accessToken };
    }

    reqConfig = {
      ...reqConfig,
      method: 'GET',
      url: `${FLIPKART.FLIPKART_BASE_URL}/sellers${nextPageUrl}`,
      data: null,
    };
    const pendingOrder = await getOrders({ apiKey, secret, axiosConfig: reqConfig, token: accessToken });
    return { orderList: [...orderList, ...pendingOrder.orderList], accessToken: pendingOrder.accessToken };
  } catch (error: any) {
    logsError(error, error?.response?.data);
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const errorCode = error.response.data?.error;
    if (errorCode === 'unauthorized' || errorCode === 'invalid_token') {
      delete reqConfig.headers.Authorization;
      const pendingOrder = await getOrders({ apiKey, secret, axiosConfig, token: accessToken });
      return { orderList: [...orderList, ...pendingOrder.orderList], accessToken: pendingOrder.accessToken };
    }
    throw error;
  }
};
