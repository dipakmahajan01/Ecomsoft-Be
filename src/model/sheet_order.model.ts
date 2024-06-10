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
  supplier_name: { type: String },
  account_id: { type: String },
  created_at: { type: String },
  is_deleted: { type: Boolean },
  updated_at: { type: String },
});

// Create the model
const Order = mongoose.model('Order', orderSchema);

export default Order;
