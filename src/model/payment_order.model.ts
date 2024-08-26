import mongoose, { Schema, Document } from 'mongoose';

// Define the interface
export interface IOrder extends Document {
  subOrderNo: string;
  orderDate: string;
  dispatchDate: string;
  productName: string;
  supplierSKU: string;
  liveOrderStatus: string;
  productGSTPercent: string;
  listingPriceInclGSTAndCommission: string;
  quantity: string;
  transactionID: string;
  paymentDate: Date;
  finalSettlementAmount: number;
  priceType: string;
  totalSaleAmountInclCommissionAndGST: string;
  saleReturnAmountInclGST: string;
  fixedFeeInclGST: string;
  warehousingFeeInclGST: string;
  shippingRevenueInclGST: string;
  shippingReturnAmountInclGST: string;
  returnPremiumInclGST: string;
  returnPremiumOfReturnInclGST: string;
  meeshoCommissionPercentage: string;
  meeshoCommissionExclGST: string;
  meeshoGoldPlatformFeeExclGST: string;
  meeshoMallPlatformFeeExclGST: string;
  fixedFeeExclGST: string;
  warehousingFeeExclGST: string;
  returnShippingChargeExclGST: string;
  gstCompensationPRPShipping: string;
  shippingChargeExclGST: string;
  otherSupportServiceChargesExclGST: string;
  waiversExclGST: string;
  netOtherSupportServiceChargesExclGST: string;
  gstOnMeeshoCommission: string;
  gstOnWarehousingFee: string;
  gstOnMeeshoGold: string;
  gstOnMeeshoMallPlatformFee: string;
  gstOnShippingCharge: string;
  cgstSGSTOnShippingCharge: string;
  gstOnReturnShippingCharge: string;
  gstOnNetOtherSupportServiceCharges: string;
  gstOnFixedFee: string;
  tcs: string;
  tdsRatePercent: string;
  tds: string;
  compensation: string;
  claims: string;
  recovery: string;
  compensationReason: string;
  claimsReason: string;
  recoveryReason: string;
  created_at: string;
}

// Create the schema
const paymentOrderSchema: Schema = new Schema({
  subOrderNo: { type: String },
  orderDate: { type: String },
  dispatchDate: { type: String },
  productName: { type: String },
  supplierSKU: { type: String },
  liveOrderStatus: { type: String },
  productGSTPercent: { type: String },
  listingPriceInclGSTAndCommission: { type: String },
  quantity: { type: String },
  transactionID: { type: String },
  paymentDate: { type: String },
  finalSettlementAmount: { type: Number },
  priceType: { type: String },
  totalSaleAmountInclCommissionAndGST: { type: String },
  saleReturnAmountInclGST: { type: String },
  fixedFeeInclGST: { type: String },
  warehousingFeeInclGST: { type: String },
  shippingRevenueInclGST: { type: String },
  shippingReturnAmountInclGST: { type: String },
  returnPremiumInclGST: { type: String },
  returnPremiumOfReturnInclGST: { type: String },
  meeshoCommissionPercentage: { type: String },
  meeshoCommissionExclGST: { type: String },
  meeshoGoldPlatformFeeExclGST: { type: String },
  meeshoMallPlatformFeeExclGST: { type: String },
  fixedFeeExclGST: { type: String },
  warehousingFeeExclGST: { type: String },
  returnShippingChargeExclGST: { type: String },
  gstCompensationPRPShipping: { type: String },
  shippingChargeExclGST: { type: String },
  otherSupportServiceChargesExclGST: { type: String },
  waiversExclGST: { type: String },
  netOtherSupportServiceChargesExclGST: { type: String },
  gstOnMeeshoCommission: { type: String },
  gstOnWarehousingFee: { type: String },
  gstOnMeeshoGold: { type: String },
  gstOnMeeshoMallPlatformFee: { type: String },
  gstOnShippingCharge: { type: String },
  cgstSGSTOnShippingCharge: { type: String },
  gstOnReturnShippingCharge: { type: String },
  gstOnNetOtherSupportServiceCharges: { type: String },
  gstOnFixedFee: { type: String },
  tcs: { type: String },
  tdsRatePercent: { type: String },
  tds: { type: String },
  compensation: { type: String },
  claims: { type: String },
  recovery: { type: String },
  compensationReason: { type: String },
  claimsReason: { type: String },
  recoveryReason: { type: String },
  created_at: { type: String },
  sheetId: { type: String },
});

// Create the model
const PaymentOrders = mongoose.model<IOrder>('payment_orders', paymentOrderSchema);

export default PaymentOrders;
