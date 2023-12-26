// ##########################################################################################################
// #### i Will remove this after completing the testing, This is only for testing the functions. ############
// ##########################################################################################################

// import order from '../model/order.model';
// import { getReturnOrders } from './return.order';
// import { getShipmentsType } from './shipmentType.order';

// const test = async () => {
//   try {
//     const returnDoc = await order.find({ status: 'RETURNED' }).distinct('order_item_id');
//     const returnVal = await getReturnOrders({
//       orderIDs: returnDoc,
//       token: 'fcc8544d-a0f1-4b87-b5e3-b1d6ae3c19e3',
//       apiKey: 'a66008645569619492a5797191b383930203',
//       secret: '174134c0729930f2ca3a5f9c5eded7ff6',
//     });
//     const shipmentDoc = await order.find({ status: 'DELIVERED' }).distinct('order_item_id');
//     const shiptmentVal = await getShipmentsType({
//       orderIDs: shipmentDoc,
//       token: "fcc8544d-a0f1-4b87-b5e3-b1d6ae3c19e3",
//       apiKey: 'a66008645569619492a5797191b383930203',
//       secret: '174134c0729930f2ca3a5f9c5eded7ff6',
//     });

//   } catch (error) {
//     logsError(error, 'Error while testing......');
//   }
// };

// export { test };
