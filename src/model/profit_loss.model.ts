import mongoose, { Schema } from 'mongoose';

export interface IOrderProfitLoss {
  sales_amount: number;
  returns_reversal: number;
  offer_amount: number;
  customer_add_ons_amount: number;
  marketplace_fees: number;
  taxes_order: number;
  offer_adjustments: number;
}
export interface IProtectionFund {
  order_spf: number;
  non_order_spf: number;
}
export interface IServicesFees {
  storage_fees: number;
  recall_fees: number;
  ads_fees: number;
  value_added_services: number;
  taxes_services: number;
}
export interface ITaxSettlement {
  tcs_recovery: number;
  tds_claims: number;
}
export interface IProfitLossModel {
  profit_loss_sheet_id: string;
  order: IOrderProfitLoss;
  mp_fee_rebate: number;
  protection_fund: IProtectionFund;
  services_fees: IServicesFees;
  tax_settlement: ITaxSettlement;
  net_bank_settlement: number;
  income_tax_credits: number;
  input_gst_tcs_credits: number;
  total_realizable_amount: number;
  payment_start_date: string;
  payment_end_date: string;
  created_at: string;
  flipkart_account_by: string;
}

const profitLossSchema = new Schema({
  profit_loss_sheet_id: { type: String, unique: true },
  order: { type: Object },
  mp_fee_rebate: { type: Number },
  protection_fund: { type: Object },
  services_fees: { type: Object },
  tax_settlement: { type: Object },
  net_bank_settlement: { type: Number },
  input_gst_tcs_credits: { type: Number },
  total_realizable_amount: { type: Number },
  income_tax_credits: { type: Number },
  payment_start_date: { type: String },
  payment_end_date: { type: String },
  created_at: { type: String },
  flipkart_account_by: { type: String },
});
const ProfitLoss = mongoose.model<IProfitLossModel>('profit_loss', profitLossSchema);

export default ProfitLoss;
