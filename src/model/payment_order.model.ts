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
}

// Create the schema
const paymentOrderSchema: Schema = new Schema(
  {
    subOrderNo: { type: String, required: true },
    orderDate: { type: Date, required: true },
    dispatchDate: { type: Date, required: true },
    productName: { type: String, required: true },
    supplierSKU: { type: String, required: true },
    liveOrderStatus: { type: String, required: true },
    productGSTPercent: { type: Number, required: true },
    listingPriceInclGSTAndCommission: { type: Number, required: true },
    quantity: { type: Number, required: true },
    transactionID: { type: String },
    paymentDate: { type: Date, required: true },
    finalSettlementAmount: { type: Number, required: true },
    priceType: { type: String },
    totalSaleAmountInclCommissionAndGST: { type: Number, required: true },
    saleReturnAmountInclGST: { type: Number, required: true },
    fixedFeeInclGST: { type: Number, required: true },
    warehousingFeeInclGST: { type: Number, required: true },
    shippingRevenueInclGST: { type: Number, required: true },
    shippingReturnAmountInclGST: { type: Number, required: true },
    returnPremiumInclGST: { type: Number, required: true },
    returnPremiumOfReturnInclGST: { type: Number, required: true },
    meeshoCommissionPercentage: { type: Number, required: true },
    meeshoCommissionExclGST: { type: Number, required: true },
    meeshoGoldPlatformFeeExclGST: { type: Number, required: true },
    meeshoMallPlatformFeeExclGST: { type: Number, required: true },
    fixedFeeExclGST: { type: Number, required: true },
    warehousingFeeExclGST: { type: Number, required: true },
    returnShippingChargeExclGST: { type: Number, required: true },
    gstCompensationPRPShipping: { type: Number, required: true },
    shippingChargeExclGST: { type: Number, required: true },
    otherSupportServiceChargesExclGST: { type: Number, required: true },
    waiversExclGST: { type: Number, required: true },
    netOtherSupportServiceChargesExclGST: { type: Number, required: true },
    gstOnMeeshoCommission: { type: Number, required: true },
    gstOnWarehousingFee: { type: Number, required: true },
    gstOnMeeshoGold: { type: Number, required: true },
    gstOnMeeshoMallPlatformFee: { type: Number, required: true },
    gstOnShippingCharge: { type: Number, required: true },
    cgstSGSTOnShippingCharge: { type: Number, required: true },
    gstOnReturnShippingCharge: { type: Number, required: true },
    gstOnNetOtherSupportServiceCharges: { type: Number, required: true },
    gstOnFixedFee: { type: Number, required: true },
    tcs: { type: Number, required: true },
    tdsRatePercent: { type: String },
    tds: { type: String },
    compensation: { type: Number, required: true },
    claims: { type: Number, required: true },
    recovery: { type: Number, required: true },
    compensationReason: { type: String },
    claimsReason: { type: String },
    recoveryReason: { type: String },
  },
  {
    timestamps: true,
  },
);

// Create the model
const PaymentOrders = mongoose.model<IOrder>('payment_orders', paymentOrderSchema);

export default PaymentOrders;
