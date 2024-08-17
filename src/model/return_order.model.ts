import mongoose, { Schema } from 'mongoose';

// Define the schema
const returnOrderSchema = new Schema(
  {
    return_order_id: { type: String },
    product_name: { type: String },
    sku: { type: String },
    variation: { type: String },
    meesho_pid: { type: String },
    category: { type: String },
    qty: { type: Number },
    order_number: { type: Number },
    sub_order_no: { type: String },
    order_date: { type: Date },
    dispatch_date: { type: Date },
    return_created_date: { type: Date },
    type_of_return: { type: String },
    sub_type: { type: String },
    expected_delivery_date: { type: Date },
    courier_partner: { type: String },
    awb_number: { type: String },
    status: { type: String },
    attempt: { type: String, default: null },
    tracking_link: { type: String },
    return_reason: { type: String, default: 'NA' },
    detailed_return_reason: { type: String, default: 'NA' },
    sheetId: { type: String },
  },
  { timestamps: true },
);

// Create the model
const ReturnOrder = mongoose.model('upcoming_return_order', returnOrderSchema);

export default ReturnOrder;
