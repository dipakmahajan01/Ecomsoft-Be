import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { ERROR, ORDER } from '../../common/global-constants';
import { logsError, responseGenerators } from '../../lib';
import SheetOrder from '../../model/sheet_order.model';
import { getOrderHandlerSchema } from '../../helpers/validation/user.validation';
import { getUserData, setPagination } from '../../common/common-function';
import ProfitLoss from '../../model/profit_loss.model';
import UserCredential from '../../model/seller_accounts.model';

export const getSheetOrderHandler = async (req: Request, res: Response) => {
  try {
    await getOrderHandlerSchema.validateAsync(req.query);
    const { user_id: userId } = getUserData(req);
    const {
      status,
      order_item_id: orderId,
      seller_sku: skuId,
      start_date: startDate,
      end_date: endDate,
      limit,
      is_analytics: isAnalytics,
      flipkart_by: flipkartBy,
    } = req.query;

    let where = {};
    if (orderId) {
      where = {
        ...where,
        ...{ order_item_id: orderId },
      };
    }
    if (skuId) {
      where = {
        ...where,
        ...{ seller_sku: skuId },
      };
    }
    if (startDate && endDate) {
      where = {
        ...where,
        ...{ invoice_date: { $gte: startDate, $lte: endDate } },
      };
    }
    if (status) {
      where = {
        ...where,
        ...{ return_type: status },
      };
    }

    if (flipkartBy !== 'All') {
      where = {
        ...where,
        flipkart_account_by: flipkartBy,
      };
    }
    const tokenUserAccount = await UserCredential.find({ user_id: userId }, { platform_id: 1 });
    const userAllAccount = tokenUserAccount.map((data) => data.platform_id);
    if (Object.keys(where).length === 0) {
      where = {
        ...where,
        ...{ flipkart_account_by: { $in: userAllAccount } },
      };
    }
    let orderAnalyticsArr = [];
    let setOrderDetailListArr;
    if (isAnalytics === 'true') {
      setOrderDetailListArr = [
        {
          $match: {
            ...where,
          },
        },
        {
          $group: {
            _id: 'null',
            total_order: { $sum: 1 },
            Customer_return: {
              $sum: {
                $cond: {
                  if: { $eq: ['$return_type', 'customer_return'] },
                  then: 1, // If status is "CUSTOMER_RETURN", set the sum to 0
                  else: 0,
                },
              },
            },
            Courier_return: {
              $sum: {
                $cond: {
                  if: { $eq: ['$return_type', 'courier_return'] },
                  then: 1, // If status is "CUSTOMER_RETURN", set the sum to 0
                  else: 0,
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ];
      orderAnalyticsArr.push(...setOrderDetailListArr);

      const orderAnalytics = await SheetOrder.aggregate(orderAnalyticsArr);
      if (orderAnalytics.length > 0) {
        const [profitLoss] = await ProfitLoss.aggregate([
          {
            $match: {
              ...where,
            },
          },
          {
            $group: {
              _id: null,
              totalSalesAmount: { $sum: '$order.sales_amount' },
              totalReturnsReversal: { $sum: '$order.returns_reversal' },
              totalOfferAmount: { $sum: '$order.offer_amount' },
              totalCustomerAddOnsAmount: { $sum: '$order.customer_add_ons_amount' },
              totalMarketplaceFees: { $sum: '$order.marketplace_fees' },
              totalOfferAdjustments: { $sum: '$order.offer_adjustments' },
              totalTaxesOrder: { $sum: '$order.taxes_order' },
              totalMPFeeRebate: { $sum: '$mp_fee_rebate' },
              totalOrderSPF: { $sum: '$protection_fund.order_spf' },
              totalNonOrderSPF: { $sum: '$protection_fund.non_order_spf' },
              totalStorageFees: { $sum: '$services_fees.storage_fees' },
              totalRecallFees: { $sum: '$services_fees.recall_fees' },
              totalAdsFees: { $sum: '$services_fees.ads_fees' },
              totalValueAddedServices: { $sum: '$services_fees.value_added_services' },
              totalTaxesServices: { $sum: '$services_fees.taxes_services' },
              totalTCSRecovery: { $sum: '$tax_settlement.tcs_recovery' },
              totalTDSClaims: { $sum: '$tax_settlement.tds_claims' },
              // Add more fields if you want to sum them
            },
          },
          {
            $addFields: {
              profit_loss: {
                $add: [
                  '$totalSalesAmount',
                  '$totalReturnsReversal',
                  '$totalOfferAmount',
                  '$totalCustomerAddOnsAmount',
                  '$totalMarketplaceFees',
                  '$totalOfferAdjustments',
                  '$totalTaxesOrder',
                  '$totalMPFeeRebate',
                  '$totalOrderSPF',
                  '$totalNonOrderSPF',
                  '$totalStorageFees',
                  '$totalRecallFees',
                  '$totalAdsFees',
                  '$totalValueAddedServices',
                  '$totalTaxesServices',
                  '$totalTCSRecovery',
                  '$totalTDSClaims',
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              profit_loss: 1,
            },
          },
        ]);

        orderAnalytics[0].profit_loss = orderAnalytics.length > 0 ? profitLoss?.profit_loss : 0;
        return res.status(StatusCodes.OK).send(responseGenerators(orderAnalytics, StatusCodes.OK, ORDER.FOUND, false));
      }
    }
    setOrderDetailListArr = [
      {
        $match: { ...where },
      },
    ];
    const pagination = await setPagination(req.query);
    const newSetOrderDetailListArr = [];
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
