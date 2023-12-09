import mongoose, { Schema } from 'mongoose';

export interface IUserCredentialModel {
  platform_id: string;
  market_place_name: string;
  user_id: string;
  api_key: string;
  secret: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  created_by: string;
  updated_by: string;
  deleted_by: string;
}
const userCredentialSchema = new Schema({
  platform_id: { type: String, unique: true },
  market_place_name: { type: String },
  user_id: { type: String },
  api_key: { type: String },
  secret: { type: String },
  account_name: { type: String },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: String },
  updated_at: { type: String },
  deleted_at: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  deleted_by: { type: String },
});
const UserCredential =  mongoose.model<IUserCredentialModel>('UserCredential', userCredentialSchema);

export default UserCredential;
