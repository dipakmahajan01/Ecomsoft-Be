import mongoose, { Schema } from 'mongoose';

// Define the schema
const OrderTrackingSchema = new Schema({
  order_tracking_id: { type: String },
  sub_order_no: { type: String },
  aws_tracking: { type: Array },
  account_id: { type: String },
  user_id: { type: String },
});

// Create the model
const OrderTracking = mongoose.model('Order_tracking', OrderTrackingSchema);

export default OrderTracking;
