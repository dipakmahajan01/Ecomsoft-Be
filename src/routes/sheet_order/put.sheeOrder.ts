import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { generatePublicId } from '../../common/common-function';
import { responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import OrderTracking from '../../model/order_tracking.mode';
import Order from '../../model/sheet_order.model';

export const updateReturnOrderHandler = async (req: Request, res: Response) => {
  try {
    // await updateReturnOrderSchema.validateAsync(req.query);
    const { account_id: accountId, order_id: OrderId } = req.body;
    const orderFound = await Order.findOne({ awb_number: OrderId });
    if (!orderFound) {
      return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.NOT_FOUND, false));
    }
    const updateOrder = await Order.findOneAndUpdate(
      { awb_number: OrderId },
      { $set: { is_return_update: true } },
      { returnOriginal: false },
    );
    const orderTrackingData = await OrderTracking.findOne({ account_id: accountId });
    if (orderTrackingData) {
      await OrderTracking.findOneAndUpdate(
        { account_id: accountId },
        { $addToSet: { aws_tracking: OrderId } },
        { new: true, runValidators: true },
      );
    } else {
      const createOrder = await OrderTracking.create({
        order_tracking_id: generatePublicId(),
        sub_order_no: '',
        aws_tracking: [OrderId],
        account_id: accountId,
      });
      if (createOrder) {
        return res.status(StatusCodes.OK).send(responseGenerators(createOrder, StatusCodes.OK, ORDER.UPDATE, false));
      }
    }
    if (!updateOrder) {
      return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.NOT_UPDATE, false));
    }
    return res.status(StatusCodes.OK).send(responseGenerators(updateOrder, StatusCodes.OK, ORDER.UPDATE, false));
    // const orderFound = await Order.findOne({ sub_order_no: orderId });
    // if (!orderFound) {
    //   return res
    //     .status(StatusCodes.BAD_REQUEST)
    //     .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ORDER.NOT_FOUND, false));
    // }
    // const alreadyOrderReturn = await Order.findOne({ sub_order_no: orderId, is_return_update: true });
    // if (alreadyOrderReturn) {
    //   return res
    //     .status(StatusCodes.BAD_REQUEST)
    //     .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ORDER.ORDER_AlREADY_SCAN, false));
    // }
    // const updateOrder = await Order.findOneAndUpdate(
    //   { sub_order_no: orderId },
    //   { $set: { is_return_update: true, issue_message: 'The product has been received but payment is pending' } },
    //   { returnOriginal: false },
    // );
    // if (!updateOrder) {
    //   return res
    //     .status(StatusCodes.BAD_REQUEST)
    //     .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ORDER.NOT_UPDATE, false));
    // }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
