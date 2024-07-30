import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import Order from '../../model/sheet_order.model';
import { updateReturnOrderSchema } from '../../helpers/validation/sheetorder.validation';

export const updateReturnOrderHandler = async (req: Request, res: Response) => {
  try {
    await updateReturnOrderSchema.validateAsync(req.query);
    const { order_id: orderId } = req.query;
    const orderFound = await Order.findOne({ sub_order_no: orderId });
    if (!orderFound) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ORDER.NOT_FOUND, false));
    }
    const alreadyOrderReturn = await Order.findOne({ sub_order_no: orderId, is_return_update: true });
    if (alreadyOrderReturn) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ORDER.ORDER_AlREADY_SCAN, false));
    }
    const updateOrder = await Order.findOneAndUpdate(
      { sub_order_no: orderId },
      { $set: { is_return_update: true, issue_message: 'The product has been received but payment is pending' } },
      { returnOriginal: false },
    );
    if (!updateOrder) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ORDER.NOT_UPDATE, false));
    }
    return res.status(StatusCodes.OK).send(responseGenerators(updateOrder, StatusCodes.OK, ORDER.UPDATE, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
