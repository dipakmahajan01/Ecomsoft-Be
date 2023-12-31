import { FLIPKART_PAYMENT_TYPES, ORDER_NET_PROFIT, STATUS } from '../../common/global-constants';

const getApplicableRate = (price: number, table: any[]) => {
  return table.find((row) => row.max_item_val >= price && row.min_item_val <= price);
};

const returnPercentageOf = (val: number, percentage: number) => {
  return (val * percentage) / 100;
};

const sortShipmentsFeesDes = (shipmentsTable) => {
  const table = structuredClone(shipmentsTable);
  return table.sort((row: any, nextRow: any) => nextRow.min_weight - row.min_weight);
};

export const calculateCommission = (customerPrice: number, commissionTable: any) => {
  const row = getApplicableRate(customerPrice, commissionTable);
  const commission = returnPercentageOf(customerPrice, row.percentage);
  return commission;
};

export const calculateFixedFees = (customerPrice: number, fixedFeesTable: any) => {
  const row = getApplicableRate(customerPrice, fixedFeesTable);
  const fixedFess = row.fees;
  return fixedFess;
};

export const calculateShippingFees = ({
  weight,
  shipmentFeesTable,
  shipmentType,
}: {
  weight: number;
  shipmentFeesTable: any[];
  shipmentType: string;
}) => {
  const rows = sortShipmentsFeesDes(shipmentFeesTable);
  let shipmentFee = 0;
  let remainingWeight = weight;
  rows.forEach((feesDetails: any) => {
    const accountableWeight = remainingWeight - feesDetails.min_weight;
    if (accountableWeight <= 0) {
      // accountableWeight is negative
      return;
    }

    const feesForEvery = feesDetails.fees_for_every;
    let multiplier = 1;
    // if 0 then multiplier will be 1;
    if (feesForEvery) {
      multiplier = accountableWeight / feesForEvery;
    }
    const fees = feesDetails[shipmentType.toLowerCase()] * multiplier;
    shipmentFee += fees;
    remainingWeight -= accountableWeight;
  });

  return shipmentFee;
};

export const calculateCollectionFee = ({
  customerPrice,
  collectionFeesTable,
  paymentType,
}: {
  customerPrice: number;
  collectionFeesTable: any[];
  paymentType: string;
}) => {
  const row = getApplicableRate(customerPrice, collectionFeesTable);
  const PType = paymentType.toUpperCase() === FLIPKART_PAYMENT_TYPES.COD ? FLIPKART_PAYMENT_TYPES.PREPAID : paymentType;

  const payment = row[PType.toLowerCase()];
  if (payment.type === 'fixed') {
    return payment.value;
  }
  const val = returnPercentageOf(customerPrice, payment.value);
  return val;
};

// RELETED TO NET PROFIT

export const returnNetProfitOf = (order: any, type: string) => {
  let loss = 0;
  const { sellingPrice } = order.priceComponents;
  switch (type) {
    case STATUS.COMPLETED:
      ORDER_NET_PROFIT.COMPLETED.forEach((fee) => {
        loss += order[fee];
      });
      return sellingPrice - loss;

    case STATUS.CUSTOMER_RETURN:
      if (!order.isReplacement) {
        ORDER_NET_PROFIT.REFUND.forEach((fee) => {
          loss += order[fee];
        });
        return -(sellingPrice - loss);
      }
      ORDER_NET_PROFIT.REPLACEMENT.forEach((fee) => {
        loss += order[fee];
      });
      return sellingPrice - loss;

    default:
      throw new Error(`Unexpected status found. STATUS: ${type}`);
  }
};
