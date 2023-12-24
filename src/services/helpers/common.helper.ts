import axios from 'axios';
import { EShipmentType, EShipmentZones } from '../common.types';
import { FLIPKART } from '../../common/global-constants';
import RateCard from '../../model/rateCard.model';
import { generatePublicId, setTimesTamp } from '../../common/common-function';

export const generateToken = async (apiKey: string, secret: string) => {
  try {
    let base64Credentials = btoa(`${apiKey}:${secret}`);
    const config = {
      method: 'get', // Change the HTTP method as needed (e.g., 'post', 'put', 'delete', etc.)
      url: FLIPKART.GENERATE_TOKEN_API,
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json', // Adjust the content type if necessary
      },
    };
    const { data } = await axios(config);
    if (!data && !data.data.access_token) {
      throw new Error(`Token not found in response for apiKet:- ${apiKey} secret:- ${secret}`);
    }
    return data.access_token;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error);
    if (!axios.isAxiosError(error)) {
      throw new Error(`Something went wrong... Please check. Message:- ${error.message}  errorCode: ${error.name}`);
    }

    const { error: errorCode, error_description: errorDescription } = error.response?.data ?? {};
    throw new Error(
      `Something is off in API or seller Credentials... Please check. Message:- ${
        errorDescription ?? error.message
      }  errorCode: ${errorCode ?? error.name}`,
    );
  }
};

export const fetchAndCacheIfNeeded = async (cache: any, fsnCode: string) => {
  if (!cache.has(fsnCode)) {
    const rateCard = await RateCard.findOne({ fsn_code: fsnCode, needs_to_add: false }).lean();
    if (!rateCard) {
      await RateCard.create({
        fsn_code: fsnCode,
        needs_to_add: true,
      });
      return null;
    }
    cache.set(fsnCode, rateCard);
  }

  return cache.get(fsnCode);
};

export function sliceIntoBatches(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    batches.push(batch);
  }
  return batches;
}

function getFirstDigits(number: string | number, digits: number): number {
  const numberString = String(number);
  const firstDigitsString = numberString.slice(0, digits);
  const firstDigits = Number(firstDigitsString);

  if (Number.isNaN(firstDigits)) {
    throw new Error(`Cannot convert "${firstDigitsString}" to a valid number.`);
  }

  return firstDigits;
}

function returnZone(firstDigitOfPinCode: string | number): EShipmentZones {
  switch (Number(firstDigitOfPinCode)) {
    case 1:
    case 2:
      return EShipmentZones.NORTH;

    case 3:
    case 4:
      return EShipmentZones.WEST;

    case 5:
    case 6:
      return EShipmentZones.SOUTH;

    case 7:
    case 8:
      return EShipmentZones.EAST;
    default:
      return EShipmentZones['N/A'];
  }
}

export function returnShipmentType(
  sellerPinCode: string | number,
  buyerPinCode: string | number,
): EShipmentType | null {
  const sellerFirstTwoDigits = getFirstDigits(sellerPinCode, 2);
  const buyerFirstTwoDigits = getFirstDigits(buyerPinCode, 2);

  const sellerFirstDigit = getFirstDigits(sellerFirstTwoDigits, 1);
  const buyerFirstDigit = getFirstDigits(buyerFirstTwoDigits, 1);

  if (sellerFirstTwoDigits === buyerFirstTwoDigits) {
    return EShipmentType.Local;
  }

  const sellerZone = returnZone(sellerFirstDigit);
  const buyerZone = returnZone(buyerFirstDigit);

  if (sellerZone === buyerZone) {
    return EShipmentType.Zonal;
  }

  if (sellerZone !== buyerZone) {
    return EShipmentType.National;
  }

  return EShipmentType['N/A'];
}

export const extractOrderData = (order: any, packageInfo: any) => {
  let totalWeight = 0;
  const packagesDetails = order.packageIds.map((id: string) => {
    const pkg = packageInfo[id];
    totalWeight += pkg.weight;
    return pkg;
  });
  return {
    order_item_id: order.orderItemId,
    flipkart_order_id: order.orderId,
    Hsn_code: order.hsn,
    fsn_code: order.fsn,
    cancellationReason: order.cancellationReason,
    cancellationSubReason: order.cancellationSubReason,
    serviceProfile: order.serviceProfile,
    courierReturn: order.courierReturn,
    flipkart_status: order.status,
    order_date: order.orderDate,
    sku: order.sku,
    priceComponents: order.priceComponents,
    quantity: order.quantity,
    paymentType: order.paymentType,
    cancellationDate: order?.cancellationDate ?? null,
    packagesDetails,
    totalWeight,
  };
};

export const extractOrderWeightInfo = (shipmentData) => {
  let packageInfo = {};

  for (let shipment of shipmentData) {
    shipment.subShipments.forEach((subShipment) => {
      if (subShipment.packages) {
        subShipment.packages.forEach((packageData) => {
          let packageDetails = {
            packageId: packageData.packageId,
            packageSku: packageData.packageSku,
            weight: packageData.dimensions.weight,
          };

          packageInfo[packageDetails.packageId] = packageDetails;
        });
      }
    });
  }

  return packageInfo;
};

export const extractOrderItemsFromShipment = (shipment) => {
  return shipment.map((shipment) => shipment.orderItems).flat();
};

export const extractOrders = (shipments) => {
  const orderItemData = extractOrderItemsFromShipment(shipments);
  const packageInfo = extractOrderWeightInfo(shipments);
  return orderItemData.map((order) => extractOrderData(order, packageInfo));
};

export const modifyAuthorAndTimeStamp = (author: string, doc: any) => {
  // Explicity adding the ignore rule for every line bsc i don't want to disable this rule for all file.
  // WARNING - This function is directly modifying the object.

  // eslint-disable-next-line no-param-reassign
  doc.created_by = author;
  // eslint-disable-next-line no-param-reassign
  doc.updated_by = author;
  // eslint-disable-next-line no-param-reassign
  doc.created_at = setTimesTamp();
  // eslint-disable-next-line no-param-reassign
  doc.updated_at = setTimesTamp();
  // eslint-disable-next-line no-param-reassign
  doc.order_id = generatePublicId();
};
