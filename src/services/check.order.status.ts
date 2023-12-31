import { differenceBetweenTwoDate, setTimesTamp } from '../common/common-function';
import { DAYS_IN_WHICH_ORDER_SHOULD_RETURNED, FLIPKART_ORDER_STATUS, STATUS } from '../common/global-constants';
import { logInfo, logsError } from '../lib';
import order from '../model/order.model';
import UserCredential from '../model/user_credential.model';
import { getOrdersByIds } from './get.orders';
import { getReturnOrders } from './return.order';
import { returnNetProfitOf } from './helpers';

export const handleOrderStatusCheck = async () => {
  try {
    const flipkartAccount = await UserCredential.find({
      user_id: '75336827-f95e-4fb5-b4a9-ea7d9b6e957f', // TODO - Remove this.
      is_deleted: false,
    });

    for (let account of flipkartAccount) {
      const last8daysOrders = await order.find({ status: STATUS.ON_GOING });
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
      const completed = [];

      last8daysOrders.forEach((order) => {
        const latestOrder = orders[order.order_item_id];
        const latestStatus = latestOrder.flipkart_status;
        const oldStatus = order.flipkart_status;

        // 10 days validation
        const isCompleted =
          differenceBetweenTwoDate(+order.order_date, setTimesTamp()) >= DAYS_IN_WHICH_ORDER_SHOULD_RETURNED;

        if (isCompleted) {
          const updatedOrder = { ...order };
          updatedOrder.net_profit = returnNetProfitOf(updatedOrder, STATUS.COMPLETED);
          updatedOrder.status = STATUS.COMPLETED;
          completed.push(updatedOrder);
        }
        // compalete status update with calculation
        if (latestStatus === oldStatus) {
          return;
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
        const updateReturnOrder = {
          ...order,
          ...returnDetails,
        };
        updateReturnOrder.net_profit = returnNetProfitOf(updateReturnOrder, STATUS.CUSTOMER_RETURN);
        updateReturnOrder.status = STATUS.CUSTOMER_RETURN;

        return updateReturnOrder;
      });

      logInfo('data', updatedReturnedOrders, cancellationOrders);
      // Query to find and update many orders.

      //  const updateData = await order.find({flipkart_order_id:flipkartOrder})
    }
  } catch (error: any) {
    logsError(error, error.response?.data);
  }
};

// TODO - Verify if the query is right from dipu..
// TODO - Question related to order.create_at field type which is currently string. But it should be timeStamp.
// TODO - Find many and update many query.
