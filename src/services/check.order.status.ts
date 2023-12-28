import { getDateBeforeDays } from '../common/common-function';
import { CHECK_STATUS_OF_DAYS, FLIPKART_ORDER_STATUS } from '../common/global-constants';
import { logInfo, logsError } from '../lib';
import order from '../model/order.model';
import UserCredential from '../model/user_credential.model';
import { getOrdersByIds } from './get.orders';
import { getReturnOrders } from './return.order';

export const handleOrderStatusCheck = async () => {
  try {
    const flipkartAccount = await UserCredential.find({
      user_id: '75336827-f95e-4fb5-b4a9-ea7d9b6e957f', // TODO - Remove this.
      is_deleted: false,
    });

    const dateBeforeDays = getDateBeforeDays(CHECK_STATUS_OF_DAYS);
    for (let account of flipkartAccount) {
      const last8daysOrders = await order.find({ created_at: { $lt: dateBeforeDays } });
      const orderIds = last8daysOrders.map((order) => order.order_item_id);
      const orders = await getOrdersByIds({
        orderIDs: orderIds,
        token: account.auth_token,
        apiKey: account.api_key,
        secret: account.secret,
      });

      // compare both order status..
      const oldReturnOrders = [];
      const OldReturnOrdersIds = [];
      const cancellationOrders = [];

      last8daysOrders.forEach((order) => {
        const latestOrder = orders[order.order_item_id];
        const latestStatus = latestOrder.flipkart_status;
        const oldStatus = order.flipkart_status;

        if (latestStatus === oldStatus) {
          return;
        }

        // check status
        if (latestStatus === FLIPKART_ORDER_STATUS.CANCELLED) {
          cancellationOrders.push({ ...order, flipkart_status: latestStatus });
        }

        if (latestStatus === FLIPKART_ORDER_STATUS.RETURNED) {
          OldReturnOrdersIds.push(order.order_item_id);
          oldReturnOrders.push({ ...order, flipkart_status: latestStatus });
        }
      });

      // Get the returns reason. and handle calculation..
      const latestReturnedOrdersDetails = await getReturnOrders({
        orderIDs: OldReturnOrdersIds,
        token: account.auth_token,
        apiKey: account.api_key,
        secret: account.secret,
      });

      const updatedReturnedOrders = oldReturnOrders.map((order) => {
        const returnDetails = latestReturnedOrdersDetails[order.order_item_id];
        return {
          ...order,
          ...returnDetails,
        };
      });

      logInfo('data', updatedReturnedOrders, cancellationOrders);
      // Query to find and update many orders.
    }
  } catch (error: any) {
    logsError(error, error.response?.data);
  }
};

// TODO - Verify if the query is right from dipu..
// TODO - Question related to order.create_at field type which is currently string. But it should be timeStamp.
// TODO - Find many and update many query.
