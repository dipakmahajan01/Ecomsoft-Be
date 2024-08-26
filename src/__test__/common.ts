import fs from 'fs';
import { mongooseConnection } from '../mongodb';
import app from '../index';
import { logsError } from '../lib';
import { Order, Payment, ReturnModalType } from './TestingData/testData';

// Config
const port = process.env.PORT || 5000;
const DATABASE_CONNECTION_URI_DEV = 'mongodb://127.0.0.1:27017/ecomsoft_test';

const baseURL = '/api';
const URL_CONFIG = {
  login: '/auth/login',
  uploadOrder: '/sheet-order/upload',
  uploadReturn: '/sheet-order/return',
  uploadPayment: '/sheet-order/payment-sheet/upload',
  getIssueOrder: '/sheet-order/return',
  cancelOrder: '/sheet-order/cancelled-order',
  scanOrder: '/sheet-order/update',
};

export const orderStrictFields: Partial<keyof Order>[] = [
  'account_id',
  // 'awb_number',
  'order_date',
  'pickup_courier_partner',
  'qty',
  // 'size',
  // 'sku',
  'supplier_name',
  // 'awb',
  'is_return_update',
  'sheetId',
  'sub_order_no',
];

export const orderTypeFields: Partial<{ key: keyof Order; type: 'boolean' | 'string' | 'number' }>[] = [
  {
    key: '_id',
    type: 'string',
  },
  {
    key: 'created_at',
    type: 'string',
  },
  {
    key: 'is_return_update',
    type: 'boolean',
  },
];

export const returnStrictFields: Partial<keyof ReturnModalType>[] = [
  'awb_number',
  'courier_partner',
  // "order_date", // Not parsing properly
  // "order_number",
  // "product_name",
  // "attempt", // storing the "null" as string but should be only null
  // "dispatch_date",
  'meesho_pid',
  // "expected_delivery_date",
  'detailed_return_reason',
  // 'qty',
  // "return_created_date",
  'return_reason',
  // "sku",
  'sub_order_no',
  'sub_type',
  'tracking_link',
  'type_of_return',
  'variation',
];

export const returnTypeFields: Partial<{ key: keyof ReturnModalType; type: 'boolean' | 'string' | 'number' }>[] = [
  // {key: "created_at", type: "string"}, Should be string but its number.
  { key: 'return_order_id', type: 'string' },
];

export const paymentStrictFields: Partial<keyof Payment>[] = [
  'cgstSGSTOnShippingCharge',
  'claims',
  'claimsReason',
  'collection',
  'compensation',
  'compensationReason',
  'finalSettlementAmount',
  'fixedFeeExclGST',
  'fixedFeeInclGST',
  'gstCompensationPRPShipping',
  'gstOnFixedFee',
  'gstOnMeeshoCommission',
  'gstOnMeeshoGold',
  'gstOnMeeshoMallPlatformFee',
  'gstOnNetOtherSupportServiceCharges',
  'gstOnReturnShippingCharge',
  // "gstOnShippingCharge",
  'gstOnWarehousingFee',
  'listingPriceInclGSTAndCommission',
  'liveOrderStatus',
  'meeshoCommissionExclGST',
  'meeshoCommissionPercentage',
  'meeshoGoldPlatformFeeExclGST',
  'meeshoMallPlatformFeeExclGST',
  'netOtherSupportServiceChargesExclGST',
  'orderDate',
  'otherSupportServiceChargesExclGST',
  'paymentDate',
  'priceType',
  'productGSTPercent',
  // 'productName',
  'quantity',
  'quantity',
  'recovery',
  'recoveryReason',
  'returnPremiumInclGST',
  'returnPremiumOfReturnInclGST',
  'returnShippingChargeExclGST',
  'saleReturnAmountInclGST',
  'shippingChargeExclGST',
  'shippingReturnAmountInclGST',
  'shippingRevenueInclGST',
  'subOrderNo',
  // "supplierSKU",
  'tcs',
  'tds',
  'tdsRatePercent',
  'totalSaleAmountInclCommissionAndGST',
  'transactionID',
  'waiversExclGST',
  'warehousingFeeExclGST',
  'warehousingFeeInclGST',
];

export const paymentTypeFields: Partial<{ key: keyof Payment; type: 'boolean' | 'string' | 'number' }>[] = [
  // {
  //   key: "created_at", type: "string",
  // },
];

// Config

// Helpers

export const connectTestDB = async () => {
  try {
    if (await mongooseConnection(DATABASE_CONNECTION_URI_DEV)) {
      // eslint-disable-next-line no-console
      console.time(`⚡️ server started with 👍🏼 database connected http://localhost:${port} in `);
      app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.timeEnd(`⚡️ server started with 👍🏼 database connected http://localhost:${port} in `);
      });
    }
  } catch (error) {
    logsError(error);
    // eslint-disable-next-line no-console
    console.timeEnd(`👎🏻 database connection has some problem : ${JSON.stringify(error)}`);
  }
};

export const getURL = (key: keyof typeof URL_CONFIG) => `${baseURL}${URL_CONFIG[key]}`;

export interface TypeField {
  key: string;
  type: string;
}

export interface ComparisonResult {
  match: boolean;
  mismatches: string[];
}

export function compareObjects(
  testData: Record<string, any>,
  data: Record<string, any>,
  strictFields: string[],
  typeFields: TypeField[],
): ComparisonResult {
  const mismatches: string[] = [];

  // Check strict value matches
  for (const field of strictFields) {
    if (testData[field] !== data[field]) {
      mismatches.push(`Field '${field}' should be '${testData[field]}', but received '${data[field]}'`);
    }
  }

  // Check strict type matches
  for (const { key, type } of typeFields) {
    if (typeof testData[key] !== type) {
      mismatches.push(`Test Field '${key}' should be of type '${type}', but is of type '${typeof testData[key]}'`);
    }
    if (typeof data[key] !== type) {
      mismatches.push(`Data Field '${key}' should be of type '${type}', but is of type '${typeof data[key]}'`);
    }
  }

  return {
    match: mismatches.length === 0,
    mismatches,
  };
}

export function generateFileName(baseName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${baseName}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export function storeTestError(obj: any, filePath: string): void {
  if (obj) {
    // Write the object to a JSON file in the same directory
    const objFilePath = `src/__test__/logs/${filePath}_${generateFileName('')}.json`;
    fs.writeFileSync(objFilePath, JSON.stringify(obj, null, 2));
  }
}
