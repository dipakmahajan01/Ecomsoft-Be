import mongoose, { Schema } from 'mongoose';

// Define the schema
const orderSchema = new Schema({
  order_id: { type: String },
  sub_order_no: { type: String },
  sku: { type: String },
  qty: { type: Number },
  size: { type: String },
  courier: { type: String },
  order_date: { type: String },
  order_price: { type: String },
  supplier_name: { type: String },
  order_status: { type: String },
  account_id: { type: String },
  created_at: { type: String },
  is_deleted: { type: Boolean },
  is_return_update: { type: Boolean, default: false },
  updated_at: { type: String },
});

// Create the model
const Order = mongoose.model('Order', orderSchema);

export default Order;
