// import mongoose, { Schema } from 'mongoose';

// export interface IOrder {
//   order_id: string;
//   order_item_id: string;
//   flipkart_order_id: string;
//   Hsn_code: string;
//   fsn_code: string;
//   status: string;
//   flipkart_status: string;
//   cancellationReason: string;
//   cancellationSubReason: string;
//   order_date: string;
//   sku: string;
//   priceComponents: {
//     sellingPrice: number;
//     totalPrice: number;
//     shippingCharge: number;
//     customerPrice: number;
//     flipkartDiscount: number;
//   };
//   quantity: number;
//   paymentType: string;
//   cancellationDate: { type: string };
//   serviceProfile: string;
//   return_order_status: string;
//   return_order_reason: string;
//   return_order_sub_reason: string;
//   return_order_shipment_status: string;
//   return_order_shipment_id: string;

//   // For calculations......
//   commission: number;
//   shippingFee: number;
//   fixedFee: number;
//   reverseShippingFee: number;
//   collectionFee: number;
//   net_profit: number;
//   created_by: string;
//   updated_by: string;
//   deleted_by: string;
//   is_deleted: boolean;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string;
// }
// const OrderSchema = new Schema({
//   order_id: { type: String, unique: true, required: true },
//   order_item_id: { type: String },
//   flipkart_order_id: { type: String, unique: true, required: true },
//   Hsn_code: { type: Number },
//   fsn_code: { type: String },
//   status: { type: String },
//   flipkart_status: { type: String },
//   cancellationReason: { type: String },
//   cancellationSubReason: { type: String },
//   order_date: { type: String },
//   sku: { type: String },
//   priceComponents: { type: Object },
//   quantity: { type: Number },
//   paymentType: { type: String },
//   cancellationDate: { type: String },
//   // For Return orders...
//   return_order_status: { type: String },
//   return_order_reason: { type: String },
//   return_order_sub_reason: { type: String },
//   return_order_shipment_status: { type: String },
//   return_order_shipment_id: { type: String },
//   serviceProfile: { type: String },
//   // For calculation....
//   commission: { type: Number },
//   shippingFee: { type: Number },
//   fixedFee: { type: Number },
//   reverseShippingFee: { type: Number },
//   collectionFee: { type: Number },
//   net_profit: { type: Number },
//   created_by: { type: String },
//   updated_by: { type: String },
//   deleted_by: { type: String },
//   is_deleted: { type: Boolean, default: false },
//   created_at: { type: String },
//   updated_at: { type: String },
//   deleted_at: { type: String },
// });

// const order = mongoose.model<IOrder>('order', OrderSchema);

// export default order;
