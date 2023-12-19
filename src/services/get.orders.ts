/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import { FLIPKART } from '../common/global-constants';
import { extractOrderData, extractOrderItemsFromShipment, generateToken, sliceIntoBatches } from './common_helper';

const FLIPKART_MAX_SHIPMENT_GET_LIMIT = 100;

const extractOrdersFromShipment = (shipments) => {
  const result = {};
  const orderItems = extractOrderItemsFromShipment(shipments);
  orderItems.forEach((order) => {
    const extracted = extractOrderData(order);
    result[order.orderItemId] = extracted;
  });

  return result;
};

export const getShipmentsType = async ({
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
        url: `${FLIPKART.GET_SHIPMENT_V2}??orderItemIds={}=${shipmentArray.toString()}`,
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
      const shipmentData = await getShipmentsType({ apiKey, secret, orderIDs, token: null });
      return { ...result, ...shipmentData };
    }
    throw error;
  }
};
