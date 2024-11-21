import mongoose, { Schema } from 'mongoose';

export interface ISessionModel {
  session_id: string;
  user_id: string;
  is_expired: boolean;
  access_token: string;
  refresh_token: string;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
const SessionSchema = new Schema({
  // session_id: { type: String, unique: true },
  is_expired: { type: Boolean, default: false },
  access_token: { type: String },
  user_id: { type: String },
  refresh_token: { type: String },
  user_type: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: String },
  updated_at: { type: String },
  deleted_at: { type: String },
});

const Session = mongoose.model<ISessionModel>('session', SessionSchema);

export default Session;
