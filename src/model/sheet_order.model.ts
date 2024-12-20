import mongoose, { Schema } from 'mongoose';

// Define the schema
const orderSchema = new Schema({
  order_id: { type: String, unique: true },
  sub_order_no: { type: String, unique: true },
  sku: { type: String },
  qty: { type: String },
  size: { type: String },
  pickup_courier_partner: { type: String },
  order_date: { type: String },
  order_price: { type: String },
  supplier_name: { type: String },
  order_status: { type: String },
  account_id: { type: String },
  created_at: { type: String },
  is_deleted: { type: Boolean },
  is_return_update: { type: Boolean, default: false },
  is_order_issue: { type: Boolean, default: false },
  issue_message: { type: String },
  updated_at: { type: String },
  awb_number: { type: String },
  return_currier_partner: { type: String },
  sheetId: { type: String },
  is_claim: { type: Boolean },
  is_exchange: { type: Boolean },
});

// Create the model
const Order = mongoose.model('Order', orderSchema);

export default Order;
