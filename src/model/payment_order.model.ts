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
  subOrderNo: { type: String },
  orderDate: { type: String },
  dispatchDate: { type: String },
  productName: { type: String },
  supplierSKU: { type: String },
  liveOrderStatus: { type: String },
  productGSTPercent: { type: Number },
  listingPriceInclGSTAndCommission: { type: Number },
  quantity: { type: Number },
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
});

// Create the model
const PaymentOrders = mongoose.model<IOrder>('payment_orders', paymentOrderSchema);

export default PaymentOrders;
