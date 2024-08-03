import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { ERROR, ITokenData, ORDER } from '../../common/global-constants';
import { logsError, responseGenerators } from '../../lib';
import sellerAccounts from '../../model/seller_accounts.model';
import Order from '../../model/sheet_order.model';
import { getAnalyticsSchema, returnOrderSchema } from '../../helpers/validation/sheetorder.validation';

// export const getSheetOrderHandler = async (req: Request, res: Response) => {
//   try {
//     await getOrderHandlerSchema.validateAsync(req.query);
//     const { user_id: userId } = getUserData(req);
//     const {
//       status,
//       order_item_id: orderId,
//       seller_sku: skuId,
//       start_date: startDate,
//       end_date: endDate,
//       limit,
//       is_analytics: isAnalytics,
//     } = req.query;

//     let where = {};
//     if (orderId) {
//       where = {
//         ...where,
//         ...{ order_item_id: orderId },
//       };
//     }
//     if (skuId) {
//       where = {
//         ...where,
//         ...{ seller_sku: skuId },
//       };
//     }
//     if (startDate && endDate) {
//       where = {
//         ...where,
//         ...{ invoice_date: { $gte: startDate, $lte: endDate } },
//       };
//     }
//     if (status) {
//       where = {
//         ...where,
//         ...{ return_type: status },
//       };
//     }

//     const tokenUserAccount = await UserCredential.find({ user_id: userId }, { platform_id: 1 });
//     const userAllAccount = tokenUserAccount.map((data) => data.platform_id);
//     if (Object.keys(where).length === 0) {
//       where = {
//         ...where,
//         ...{ seller_account_id: { $in: userAllAccount } },
//       };
//     }
//     let orderAnalyticsArr = [];
//     let setOrderDetailListArr;
//     if (isAnalytics === 'true') {
//       setOrderDetailListArr = [
//         {
//           $match: {
//             ...where,
//           },
//         },
//         {
//           $group: {
//             _id: 'null',
//             total_order: { $sum: 1 },
//             Customer_return: {
//               $sum: {
//                 $cond: {
//                   if: { $eq: ['$return_type', 'customer_return'] },
//                   then: 1, // If status is "CUSTOMER_RETURN", set the sum to 0
//                   else: 0,
//                 },
//               },
//             },
//             Courier_return: {
//               $sum: {
//                 $cond: {
//                   if: { $eq: ['$return_type', 'courier_return'] },
//                   then: 1, // If status is "CUSTOMER_RETURN", set the sum to 0
//                   else: 0,
//                 },
//               },
//             },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//           },
//         },
//       ];
//       orderAnalyticsArr.push(...setOrderDetailListArr);

//       const orderAnalytics = await Order.aggregate(orderAnalyticsArr);
//       if (orderAnalytics.length > 0) {
//         const [profitLoss] = await ProfitLoss.aggregate([
//           {
//             $match: {
//               ...where,
//             },
//           },
//           {
//             $group: {
//               _id: null,
//               totalSalesAmount: { $sum: '$order.sales_amount' },
//               totalReturnsReversal: { $sum: '$order.returns_reversal' },
//               totalOfferAmount: { $sum: '$order.offer_amount' },
//               totalCustomerAddOnsAmount: { $sum: '$order.customer_add_ons_amount' },
//               totalMarketplaceFees: { $sum: '$order.marketplace_fees' },
//               totalOfferAdjustments: { $sum: '$order.offer_adjustments' },
//               totalTaxesOrder: { $sum: '$order.taxes_order' },
//               totalMPFeeRebate: { $sum: '$mp_fee_rebate' },
//               totalOrderSPF: { $sum: '$protection_fund.order_spf' },
//               totalNonOrderSPF: { $sum: '$protection_fund.non_order_spf' },
//               totalStorageFees: { $sum: '$services_fees.storage_fees' },
//               totalRecallFees: { $sum: '$services_fees.recall_fees' },
//               totalAdsFees: { $sum: '$services_fees.ads_fees' },
//               totalValueAddedServices: { $sum: '$services_fees.value_added_services' },
//               totalTaxesServices: { $sum: '$services_fees.taxes_services' },
//               totalTCSRecovery: { $sum: '$tax_settlement.tcs_recovery' },
//               totalTDSClaims: { $sum: '$tax_settlement.tds_claims' },
//               // Add more fields if you want to sum them
//             },
//           },
//           {
//             $addFields: {
//               profit_loss: {
//                 $add: [
//                   '$totalSalesAmount',
//                   '$totalReturnsReversal',
//                   '$totalOfferAmount',
//                   '$totalCustomerAddOnsAmount',
//                   '$totalMarketplaceFees',
//                   '$totalOfferAdjustments',
//                   '$totalTaxesOrder',
//                   '$totalMPFeeRebate',
//                   '$totalOrderSPF',
//                   '$totalNonOrderSPF',
//                   '$totalStorageFees',
//                   '$totalRecallFees',
//                   '$totalAdsFees',
//                   '$totalValueAddedServices',
//                   '$totalTaxesServices',
//                   '$totalTCSRecovery',
//                   '$totalTDSClaims',
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 0,
//               profit_loss: 1,
//             },
//           },
//         ]);

//         orderAnalytics[0].profit_loss = orderAnalytics.length > 0 ? profitLoss?.profit_loss : 0;
//         return res.status(StatusCodes.OK).send(responseGenerators(orderAnalytics, StatusCodes.OK, ORDER.FOUND, false));
//       }
//     }
//     setOrderDetailListArr = [
//       {
//         $match: { ...where },
//       },
//     ];
//     const pagination = await setPagination(req.query);
//     const newSetOrderDetailListArr = [];
//     if (limit) {
//       newSetOrderDetailListArr.push(
//         ...setOrderDetailListArr,
//         { $limit: pagination.limit + pagination.offset },
//         { $sort: pagination.sort },
//       );
//     }
//     let orderDetailList = await order.aggregate(
//       newSetOrderDetailListArr.length > 0 ? newSetOrderDetailListArr : setOrderDetailListArr,
//     );
//     const orderCount = await order.aggregate(setOrderDetailListArr).count('data').exec();
//     const dataCount = orderCount.length > 0 ? orderCount[0].data : 0;
//     const data = {
//       dataCount,
//       orderDetailList,
//     };
//     return res.status(StatusCodes.OK).send(responseGenerators(data, StatusCodes.OK, ORDER.FOUND, false));
//   } catch (error) {
//     logsError(error);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
//   }
// };

export const returnOrderHandler = async (req: Request, res: Response) => {
  try {
    await returnOrderSchema.validateAsync(req.query);
    const { account_id: accountId, status, is_return_update: isReturnUpdate, is_order_issue: isOrderIssue } = req.query;
    const tokenData = (await (req.headers as any).tokenData) as ITokenData;
    const where: any = {};

    if (accountId !== 'all') {
      const accountDetails = await sellerAccounts.findOne({ platform_id: accountId });
      if (!accountDetails) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'Account not found', true));
      }
      where.account_id = accountId;
    } else {
      const accountIds = await sellerAccounts
        .findOne({ user_id: tokenData.user_id }, { platform_id: 1 })
        ?.distinct('platform_id');
      where.account_id = { $in: accountIds };
    }

    (() => {
      if (isReturnUpdate) {
        where.is_return_update = isReturnUpdate === 'true';

        if (where.is_return_update) {
          if (status) {
            where.order_status = status;
          }
        } else {
          where.order_status = { $nin: ['completed', 'customerReturn', 'currierReturn'] };
        }
        return;
      }

      if (isOrderIssue) {
        where.is_order_issue = isOrderIssue === 'true';
        return;
      }

      if (status === 'completed') {
        where.order_status = status;
      }
    })();

    const matchStage = { $match: where };
    const returnOrderDetail = await Order.aggregate([matchStage]);

    return res.status(StatusCodes.OK).send(responseGenerators(returnOrderDetail, StatusCodes.OK, ORDER.FOUND, false));
  } catch (error) {
    logsError(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};

export const getOrderCountHandler = async (req: Request, res: Response) => {
  try {
    await getAnalyticsSchema.validateAsync(req.query);
    const tokenData = (req.headers as any).tokenData as ITokenData;
    const { account_id: accountId } = req.query;
    let where: any = {};
    if (accountId !== 'all') {
      where.account_id = accountId;
    } else {
      const accountIds = await sellerAccounts
        .findOne({ user_id: tokenData.user_id }, { platform_id: 1 })
        ?.distinct('platform_id');
      where.account_id = { $in: accountIds };
    }

    const getAnalyticsHandler = await Order.aggregate([
      {
        $match: {
          ...where,
        },
      },
      {
        $group: {
          _id: null,
          totalOrder: {
            $sum: {
              $cond: {
                if: { $and: [{ $eq: ['$is_return_update', false] }, { $ne: ['$order_status', 'completed'] }] },
                then: 1,
                else: 0,
              },
            },
          },
          totalReturn: {
            $sum: {
              $cond: {
                if: { $and: [{ $eq: ['$is_return_update', true] }, { $ne: ['$order_status', 'completed'] }] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ]);
    return res.status(StatusCodes.OK).send(responseGenerators(getAnalyticsHandler, StatusCodes.OK, ORDER.FOUND, false));
  } catch (error) {
    logsError(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};

export const getSellerAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const { account_id: accountId } = req.query;
    const tokenData = (req.headers as any).tokenData as ITokenData;
    const where: any = {};

    if (accountId && accountId !== 'all') {
      where.account_id = accountId;
    } else {
      const accountDetails = (await sellerAccounts.find({ user_id: tokenData.user_id }, { platform_id: 1 })).map(
        (data) => data.platform_id,
      );
      where.account_id = { $in: accountDetails };
    }

    const orderArr = [
      {
        $match: { ...where },
      },
      {
        $lookup: {
          from: 'payment_orders',
          localField: 'sub_order_no',
          foreignField: 'subOrderNo',
          as: 'orderDetails',
        },
      },
      {
        $unwind: { path: '$orderDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: 'null',
          totalOrder: { $sum: 1 },
          totalReturn: { $sum: { $cond: [{ $eq: ['$is_return_update', true] }, 1, 0] } },
          totalProfit: {
            $sum: {
              $cond: [{ $eq: ['$order_status', 'completed'] }, '$orderDetails.finalSettlementAmount', 0],
            },
          },
          totalCustomerReturnLoss: {
            $sum: {
              $cond: [{ $eq: ['$order_status', 'customerReturn'] }, '$orderDetails.finalSettlementAmount', 0],
            },
          },
          totalCustomerReturn: {
            $sum: { $cond: [{ $eq: ['$order_status', 'customerReturn'] }, 1, 0] },
          },
          totalCurrieReturn: {
            $sum: { $cond: [{ $eq: ['$order_status', 'currierReturn'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: { totalSales: { $add: ['$totalProfit', '$totalCustomerReturnLoss'] } },
      },
    ];
    const [sellerAnalytics] = await Order.aggregate(orderArr);
    return res.status(StatusCodes.OK).send(responseGenerators(sellerAnalytics, StatusCodes.OK, ORDER.FOUND, false));
  } catch (error) {
    logsError(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
