import { date15DaysAgo } from '../common/common-function';
import Order from '../model/sheet_order.model';

/* eslint-disable consistent-return */
export const createIssueOrder = async () => {
  try {
    await Order.updateMany(
      { order_date: { $lte: await date15DaysAgo() }, is_return_update: false },
      { $set: { is_order_issue: true } },
    );
  } catch (error) {
    return error;
  }
};
