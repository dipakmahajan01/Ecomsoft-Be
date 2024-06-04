import mongoose, { Schema } from 'mongoose';

export interface ISellerAccountModel {
  platform_id: string;
  market_place_name: string;
  user_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_by: string;
  updated_by: string;
  deleted_by: string;
}
const sellerAccount = new Schema({
  platform_id: { type: String, unique: true },
  market_place_name: { type: String },
  user_id: { type: String },
  account_name: { type: String },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: String },
  updated_at: { type: String },
  deleted_at: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  deleted_by: { type: String },
});
const sellerAccounts = mongoose.model<ISellerAccountModel>('seller_accounts', sellerAccount);

export default sellerAccounts;
