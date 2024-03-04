import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { ERROR, ORDER } from '../../common/global-constants';
import { logsError, responseGenerators } from '../../lib';
import SheetOrder from '../../model/sheet_order.model';
import { getOrderHandlerSchema } from '../../helpers/validation/user.validation';
import { setPagination } from '../../common/common-function';

export const getSheetOrderHandler = async (req: Request, res: Response) => {
  try {
    await getOrderHandlerSchema.validateAsync(req.query);
    const {
      status,
      order_id: orderId,
      sku_id: skuId,
      start_date: startDate,
      end_date: endDate,
      limit,
      is_analytics: isAnalytics,
      flipkart_status: flipkartStatus,
      flipkart_by: flipkartBy,
    } = req.query;

    let where = {};
    if (orderId) {
      where = {
        ...where,
        ...{ order_id: orderId },
      };
    }
    if (skuId) {
      where = {
        ...where,
        ...{ sku: skuId },
      };
    }
    if (startDate && endDate) {
      where = {
        ...where,
        ...{ order_date: { $gte: startDate, $lte: endDate } },
      };
    }
    if (status) {
      where = {
        ...where,
        ...{ status },
      };
    }

    if (flipkartBy !== 'All') {
      where = {
        ...where,
        flipkart_account_by: flipkartBy,
      };
    }
    if (flipkartStatus) {
      where = {
        ...where,
        ...{ flipkart_status: flipkartStatus },
      };
    }
    let orderAnalyticsArr = [];
    if (isAnalytics) {
      orderAnalyticsArr.push({});
    }
    const setOrderDetailListArr: any = [
      {
        $match: {
          ...where,
        },
      },
      {
        $addFields: {
          profit: {
            $sum: [
              '$marketplace_fee_rs_sum_v_ai',
              '$sale_amount_rs',
              '$refund_rs',
              '$customer_add_ons_amount_rs',
              '$total_offer_amount_invoice',
              '$offer_adjustments_rs',
              '$taxes_rs',
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          order_id: { $first: '$order_id' },
          net_profit: {
            $sum: '$profit',
          },
          total_order: { $sum: 1 },
          profit: { $first: '$profit' },
        },
      },
    ];
    let newSetOrderDetailListArr = [];
    const pagination = await setPagination(req.query);
    if (limit) {
      newSetOrderDetailListArr.push(
        ...setOrderDetailListArr,
        { $limit: pagination.limit + pagination.offset },
        { $sort: pagination.sort },
      );
    }
    let orderDetailList = await SheetOrder.aggregate(
      newSetOrderDetailListArr.length > 0 ? newSetOrderDetailListArr : setOrderDetailListArr,
    );
    // if (isAnalytics) {
    //   [orderDetailList] =
    // } else {
    //   orderDetailList = await SheetOrder.aggregate(
    //     newSetOrderDetailListArr.length > 0 ? newSetOrderDetailListArr : setOrderDetailListArr,
    //   );
    // }
    const orderCount = await SheetOrder.aggregate(setOrderDetailListArr).count('data').exec();
    const dataCount = orderCount.length > 0 ? orderCount[0].data : 0;
    const data = {
      dataCount,
      orderDetailList,
    };
    return res.status(StatusCodes.OK).send(responseGenerators(data, StatusCodes.OK, ORDER.FOUND, false));
  } catch (error) {
    logsError(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
