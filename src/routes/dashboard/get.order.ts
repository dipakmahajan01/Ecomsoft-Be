import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logsError, responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import order from '../../model/order.model';
import { setPagination } from '../../common/common-function';
import { getOrderHandlerSchema } from '../../helpers/validation/user.validation';

export const getOrderHandler = async (req: Request, res: Response) => {
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
    if (flipkartStatus) {
      where = {
        ...where,
        ...{ flipkart_status: flipkartStatus },
      };
    }
    let orderAnalyticsArr = [];
    if (isAnalytics) {
      orderAnalyticsArr.push({
        $group: {
          _id: 'null',
          net_profit: { $sum: '$totalOrderRate' },
          total_order: { $sum: 1 },
          Customer_return: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'CUSTOMER_RETURN'] },
                then: 1, // If status is "CUSTOMER_RETURN", set the sum to 0
                else: 0,
              },
            },
          },
          Courier_return: {
            $sum: {
              $cond: {
                if: { $eq: ['$status', 'COURIER_RETURN'] },
                then: 1, // If status is "CUSTOMER_RETURN", set the sum to 0
                else: 0,
              },
            },
          },
        },
      });
    }
    const setOrderDetailListArr: any = [
      {
        $match: {
          ...where,
          is_deleted: false,
        },
      },
      {
        $project: {
          _id: 1,
          order_id: 1,
          order_item_id: 1,
          flipkart_order_id: 1,
          Hsn_code: 1,
          fsn_code: 1,
          status: 1,
          flipkart_status: 1,
          order_date: 1,
          sku: 1,
          priceComponents: 1,
          quantity: 1,
          paymentType: 1,
          serviceProfile: 1,
          commission: 1,
          shippingFee: 1,
          fixedFee: 1,
          reverseShippingFee: 1,
          collectionFee: 1,
          created_by: 1,
          updated_by: 1,
          is_deleted: 1,
          created_at: 1,
          updated_at: 1,
          net_profit: 1,
          totalOrderRate: {
            $sum: ['$commission', '$collectionFee', '$fixedFee', '$shippingFee', '$reverseShippingFee'],
          },
        },
      },
      ...orderAnalyticsArr,
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
    let orderDetailList;
    if (isAnalytics) {
      [orderDetailList] = await order.aggregate(
        newSetOrderDetailListArr.length > 0 ? newSetOrderDetailListArr : setOrderDetailListArr,
      );
    } else {
      orderDetailList = await order.aggregate(
        newSetOrderDetailListArr.length > 0 ? newSetOrderDetailListArr : setOrderDetailListArr,
      );
    }
    const orderCount = await order.aggregate(setOrderDetailListArr).count('data').exec();
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
