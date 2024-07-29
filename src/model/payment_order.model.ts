import mongoose, { Schema, Document } from 'mongoose';

// Define the interface
interface IOrder extends Document {
  subOrderNo: string;
  orderDate: Date;
  dispatchDate: Date;
  productName: string;
  supplierSKU: string;
  liveOrderStatus: string;
  productGSTPercent: number;
  listingPriceInclGSTAndCommission: number;
  quantity: number;
  transactionID: string;
  paymentDate: Date;
  finalSettlementAmount: number;
  priceType: string;
  totalSaleAmountInclCommissionAndGST: number;
  saleReturnAmountInclGST: number;
  fixedFeeInclGST: number;
  warehousingFeeInclGST: number;
  shippingRevenueInclGST: number;
  shippingReturnAmountInclGST: number;
  returnPremiumInclGST: number;
  returnPremiumOfReturnInclGST: number;
  meeshoCommissionPercentage: number;
  meeshoCommissionExclGST: number;
  meeshoGoldPlatformFeeExclGST: number;
  meeshoMallPlatformFeeExclGST: number;
  fixedFeeExclGST: number;
  warehousingFeeExclGST: number;
  returnShippingChargeExclGST: number;
  gstCompensationPRPShipping: number;
  shippingChargeExclGST: number;
  otherSupportServiceChargesExclGST: number;
  waiversExclGST: number;
  netOtherSupportServiceChargesExclGST: number;
  gstOnMeeshoCommission: number;
  gstOnWarehousingFee: number;
  gstOnMeeshoGold: number;
  gstOnMeeshoMallPlatformFee: number;
  gstOnShippingCharge: number;
  cgstSGSTOnShippingCharge: number;
  gstOnReturnShippingCharge: number;
  gstOnNetOtherSupportServiceCharges: number;
  gstOnFixedFee: number;
  tcs: number;
  tdsRatePercent: string;
  tds: string;
  compensation: number;
  claims: number;
  recovery: number;
  compensationReason: string;
  claimsReason: string;
  recoveryReason: string;
  created_at: string;
}

// Create the schema
const paymentOrderSchema: Schema = new Schema({
  subOrderNo: { type: String, unique: true },
  orderDate: { type: Date },
  dispatchDate: { type: Date },
  productName: { type: String },
  supplierSKU: { type: String },
  liveOrderStatus: { type: String },
  productGSTPercent: { type: Number },
  listingPriceInclGSTAndCommission: { type: Number },
  quantity: { type: Number },
  transactionID: { type: String },
  paymentDate: { type: Date },
  finalSettlementAmount: { type: Number },
  priceType: { type: String },
  totalSaleAmountInclCommissionAndGST: { type: Number },
  saleReturnAmountInclGST: { type: Number },
  fixedFeeInclGST: { type: Number },
  warehousingFeeInclGST: { type: Number },
  shippingRevenueInclGST: { type: Number },
  shippingReturnAmountInclGST: { type: Number },
  returnPremiumInclGST: { type: Number },
  returnPremiumOfReturnInclGST: { type: Number },
  meeshoCommissionPercentage: { type: Number },
  meeshoCommissionExclGST: { type: Number },
  meeshoGoldPlatformFeeExclGST: { type: Number },
  meeshoMallPlatformFeeExclGST: { type: Number },
  fixedFeeExclGST: { type: Number },
  warehousingFeeExclGST: { type: Number },
  returnShippingChargeExclGST: { type: Number },
  gstCompensationPRPShipping: { type: Number },
  shippingChargeExclGST: { type: Number },
  otherSupportServiceChargesExclGST: { type: Number },
  waiversExclGST: { type: Number },
  netOtherSupportServiceChargesExclGST: { type: Number },
  gstOnMeeshoCommission: { type: Number },
  gstOnWarehousingFee: { type: Number },
  gstOnMeeshoGold: { type: Number },
  gstOnMeeshoMallPlatformFee: { type: Number },
  gstOnShippingCharge: { type: Number },
  cgstSGSTOnShippingCharge: { type: Number },
  gstOnReturnShippingCharge: { type: Number },
  gstOnNetOtherSupportServiceCharges: { type: Number },
  gstOnFixedFee: { type: Number },
  tcs: { type: Number },
  tdsRatePercent: { type: String },
  tds: { type: String },
  compensation: { type: Number },
  claims: { type: Number },
  recovery: { type: Number },
  compensationReason: { type: String },
  claimsReason: { type: String },
  recoveryReason: { type: String },
  created_at: { type: String },
});

// Create the model
const PaymentOrders = mongoose.model<IOrder>('payment_orders', paymentOrderSchema);

export default PaymentOrders;
