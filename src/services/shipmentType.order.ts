/* eslint-disable no-console */
import axios, { AxiosRequestConfig } from 'axios';
import { FLIPKART } from '../common/global-constants';
import { generateToken, returnShipmentType, sliceIntoBatches } from './helpers';
import { logsError } from '../lib';

const FLIPKART_MAX_SHIPMENT_GET_LIMIT = 100;

const extractAddressFromShipment = (data) => {
  const res = {};
  data?.shipments.forEach((order) => {
    let address = {
      deliveryAddress: null,
      sellerAddress: null,
    };

    for (const key of Object.keys(address)) {
      const { addressLine1, addressLine2, city, state, pincode, stateCode, stateName, landmark } = order[key];
      address[key] = {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        stateCode,
        stateName,
        landmark,
      };
    }

    const shipmentType = returnShipmentType(address.sellerAddress.pincode, address.deliveryAddress.pincode);

    const shipment = {
      shipmentType,
      deliveryAddress: address.deliveryAddress,
      sellerAddress: address.sellerAddress,
    };

    const { orderItems } = order;
    orderItems.forEach((order) => {
      res[order.id] = shipment;
    });
  });
  return res;
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
}): Promise<{ [orderId: string]: any }> => {
  let result = {};
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
        url: `${FLIPKART.GET_SHIPMENT_V2}?orderItemIds=${shipmentArray.toString()}`,
        data: null,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const { data: shipmentsData = [] } = await axios(reqConfig);
      const extractedShipment = extractAddressFromShipment(shipmentsData);
      result = { ...result, ...extractedShipment };
    }
    return result;
  } catch (error: any) {
    logsError(error, error?.response?.data);
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
