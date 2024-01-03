import { differenceBetweenTwoDate, setTimesTamp } from '../common/common-function';
import { FLIPKART_ORDER_STATUS, RETURN_DEADLINE_IN_DAYS, STATUS } from '../common/global-constants';
import { logInfo, logsError } from '../lib';
import orderModel from '../model/order.model';
import UserCredential from '../model/user_credential.model';
import { getOrdersByIds } from './get.orders';
import { getReturnOrders } from './return.order';
import { returnNetProfitOf } from './helpers';

export const handleOrderStatusCheck = async () => {
  let currentAccount = null;
  let currentDoc = null;
  try {
    const flipkartAccount = await UserCredential.find({
      user_id: '75336827-f95e-4fb5-b4a9-ea7d9b6e957f', // TODO - Remove this.
      is_deleted: false,
    });

    for (let account of flipkartAccount) {
      currentAccount = account._id;
      const onGoingOrders = await orderModel.find({ status: STATUS.ON_GOING }).lean();
      const orderIds = onGoingOrders.map((order) => order.order_item_id);
      const orders = await getOrdersByIds({
        orderIDs: orderIds,
        token: account.auth_token,
        apiKey: account.api_key,
        secret: account.secret,
      });

      // compare both order status..
      const oldReturnOrders = [];
      const OldReturnOrdersIds = [];
      const completedOrderIds = [];
      const completedOrders = [];

      // eslint-disable-next-line @typescript-eslint/no-loop-func
      onGoingOrders.forEach((order) => {
        currentDoc = order.order_item_id;
        const latestOrder = orders[order.order_item_id];
        const latestStatus = latestOrder.flipkart_status;

        // completed status update with calculation
        if (latestStatus === STATUS.DELIVERED) {
          // 10 days validation
          const isCompleted = differenceBetweenTwoDate(+order.order_date, setTimesTamp()) >= RETURN_DEADLINE_IN_DAYS;

          if (isCompleted) {
            const updatedOrder: any = { ...order };
            updatedOrder.net_profit = returnNetProfitOf(updatedOrder, STATUS.COMPLETED);
            updatedOrder.status = STATUS.COMPLETED;
            completedOrderIds.push(updatedOrder.order_item_id);
            completedOrders.push(updatedOrder);
          } else {
            return;
          }
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

      logInfo('data', updatedReturnedOrders);
      // Query to find and update many orders.
      for (let order of [...updatedReturnedOrders, ...completedOrders]) {
        await orderModel.findOneAndUpdate({ order_item_id: order.order_item_id }, { $set: order });
      }
    }
  } catch (error: any) {
    logsError(error, { currentAccount, currentDoc });
  }
};

// TODO - Verify if the query is right from dipu..
// TODO - Question related to order.create_at field type which is currently string. But it should be timeStamp.
// TODO - Find many and update many query.
