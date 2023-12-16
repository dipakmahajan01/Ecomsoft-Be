import mongoose, { Schema } from 'mongoose';

export interface IOrder {
  order_item_id: string;
  flipkart_order_id: string;
  Hsn_code: string;
  fsn_code: string;
  status: string;
  order_date: string;
  sku: string;
  priceComponents: string;
  quantity: number;
  paymentType: string;
  cancellationDate: { type: string };
  order_id: string;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
const OrderSchema = new Schema({
  order_id: { type: String },
  order_item_id: { type: String },
  flipkart_order_id: { type: String },
  Hsn_code: { type: Number },
  fsn_code: { type: String },
  status: { type: String },
  order_date: { type: String },
  sku: { type: String },
  priceComponents: { type: Object },
  quantity: { type: Number },
  paymentType: { type: String },
  cancellationDate: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: String },
  updated_at: { type: String },
  deleted_at: { type: String },
});

const order = mongoose.model<IOrder>('order', OrderSchema);

export default order;
