import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import Order from '../../model/sheet_order.model';

export const updateReturnOrderHandler = async (req: Request, res: Response) => {
  try {
    const { order_id: orderId } = req.query;
    const orderFound = await Order.findOne({ sub_order_no: orderId });
    if (!orderFound) {
      return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.NOT_FOUND, false));
    }
    const updateOrder = await Order.findOneAndUpdate(
      { sub_order_no: orderId },
      { $set: { is_return_update: true } },
      { returnOriginal: false },
    );
    if (!updateOrder) {
      return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.NOT_UPDATE, false));
    }
    return res.status(StatusCodes.OK).send(responseGenerators(updateOrder, StatusCodes.OK, ORDER.UPDATE, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
