import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import { convertIntoUnix, generatePublicId, getUserData, setTimesTamp } from '../../common/common-function';
import UserCredential from '../../model/user_credential.model';
import SheetOrder from '../../model/sheet_order.model';
import { responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import ProfitLoss from '../../model/profit_loss.model';

export const uploadOrderSheetHandler = async (req: Request, res: Response) => {
  try {
    const { user_id: userId } = getUserData(req);
    const fileLocation: any = req.file.buffer;
    const { account_name: accountName, sheet_start_date: sheetStartDate, sheet_end_date: sheetEndDate } = req.body;
    const startDate = convertIntoUnix(sheetStartDate);
    const endDate = convertIntoUnix(sheetEndDate);
    const file = XLSX.read(fileLocation);
    // console.log('file :>> ', file);
    const sheetNameList = file.SheetNames;
    let orders = [];
    let sheets;
    const flipkartAccount = await UserCredential.findOne({ account_name: accountName });
    if (!flipkartAccount) {
      return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, 'Account not found'));
    }
    for (const sheetName of sheetNameList) {
      if (sheetName === 'Summary of report') {
        let sheetsDate = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 0, range: 2 });
        let paymentDurationDate: any = sheetsDate[0];
        const [startDateString, endDateString] = paymentDurationDate.__EMPTY_2.split(' - ');
        const date = dayjs(startDateString);
        const startMonth = date.month() + 1;
        const startYear = date.year();
        const paymentDurationStartDate = convertIntoUnix(startDateString);
        const paymentDurationEndDate = convertIntoUnix(endDateString);

        if (paymentDurationStartDate !== startDate && paymentDurationEndDate !== endDate) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send(responseGenerators({}, StatusCodes.BAD_REQUEST, 'please select valid Sheet Date', true));
        }
        const sheetProfitLoss = await ProfitLoss.findOne({ month: startMonth, year: startYear });
        if (sheetProfitLoss) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send(responseGenerators({}, StatusCodes.BAD_REQUEST, 'sheet already upload', true));
        }
        sheets = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 0, range: 7 });
        for (let i = 1; i < sheets.length; i += 1) {
          let sheetData = sheets[i];

          // Header Title Remove space and special character:
          const orderData: any = Object.entries(sheetData).reduce((acc, curr) => {
            let [key, value] = curr;
            // Checking if the key is a string
            acc[typeof key === 'string' ? key.trim().toLowerCase().replace(/[\W_]/g, '_') : key] = value;
            return acc;
          }, {});
          orders.push(orderData);
        }

        let profitLossData: any = {
          profit_loss_sheet_id: generatePublicId(),
          order: {},
          mp_fee_rebate: 0,
          protection_fund: {},
          services_fees: {},
          tax_settlement: {},
          net_bank_settlement: 0,
          input_gst_tcs_credits: 0,
          total_realizable_amount: 0,
          income_tax_credits: 0,
          month: startMonth,
          year: startYear,
          payment_start_date: paymentDurationStartDate.toString(),
          payment_end_date: paymentDurationEndDate.toString(),
          created_at: setTimesTamp().toString(),
          flipkart_by: flipkartAccount.platform_id,
        };
        let isTexes = false;
        for (const order of orders) {
          profitLossData.order.sales_amount =
            order.break_up_l1 === 'Sales Amount' ? order.break_up_l1__rs__ : profitLossData.order.sales_amount;
          profitLossData.order.returns_reversal =
            order.break_up_l1 === 'Returns Reversal' ? order.break_up_l1__rs__ : profitLossData.order.returns_reversal;
          profitLossData.order.offer_amount =
            order.break_up_l1 === 'Offer Amount' ? order.break_up_l1__rs__ : profitLossData.order.offer_amount;
          profitLossData.order.customer_add_ons_amount =
            order.break_up_l1 === 'Customer Add-Ons Amount'
              ? order.break_up_l1__rs__
              : profitLossData.order.customer_add_ons_amount;
          profitLossData.order.marketplace_fees =
            order.break_up_l1 === 'Marketplace Fees' ? order.break_up_l1__rs__ : profitLossData.order.marketplace_fees;
          if (order.break_up_l1 === 'Taxes' && !isTexes) {
            profitLossData.order.taxes_order = order.break_up_l1__rs__;
            isTexes = true;
          } else if (order.break_up_l1 === 'Taxes' && isTexes) {
            profitLossData.services_fees.taxes_services = order.break_up_l1__rs__;
          }
          profitLossData.order.offer_adjustments =
            order.break_up_l1 === 'Offer Adjustments'
              ? order.break_up_l1__rs__
              : profitLossData.order.offer_adjustments;

          profitLossData.mp_fee_rebate =
            order.break_up_l1 === 'MP Fee Rebate' ? order.break_up_l1__rs__ : profitLossData.mp_fee_rebate;

          profitLossData.protection_fund.order_spf =
            order.break_up_l1 === 'Order SPF' ? order.break_up_l1__rs__ : profitLossData.protection_fund.order_spf;
          profitLossData.protection_fund.non_order_spf =
            order.break_up_l1 === 'Non-Order SPF'
              ? order.break_up_l1__rs__
              : profitLossData.protection_fund.non_order_spf;

          profitLossData.services_fees.storage_fees =
            order.break_up_l1 === 'Storage Fees' ? order.break_up_l1__rs__ : profitLossData.services_fees.storage_fees;
          profitLossData.services_fees.recall_fees =
            order.break_up_l1 === 'Recall Fees' ? order.break_up_l1__rs__ : profitLossData.services_fees.recall_fees;
          profitLossData.services_fees.ads_fees =
            order.break_up_l1 === 'Ads Fees' ? order.break_up_l1__rs__ : profitLossData.services_fees.ads_fees;
          profitLossData.services_fees.value_added_services =
            order.break_up_l1 === 'Value Added Services'
              ? order.break_up_l1__rs__
              : profitLossData.services_fees.value_added_services;

          profitLossData.tax_settlement.tcs_recovery =
            order.break_up_l1 === 'TCS Recovery' ? order.break_up_l1__rs__ : 0;
          profitLossData.tax_settlement.tds_claims = order.break_up_l1 === 'TDS Claims' ? order.break_up_l1__rs__ : 0;

          profitLossData.net_bank_settlement =
            order.line_item === 'Net Bank Settlement (A)'
              ? order.amount_settled__rs__
              : profitLossData.net_bank_settlement;
          profitLossData.input_gst_tcs_credits =
            order.line_item === 'Input GST + TCS Credits (B)'
              ? order.amount_settled__rs__
              : profitLossData.input_gst_tcs_credits;
          profitLossData.total_realizable_amount =
            order.line_item === 'Total Realizable Amount'
              ? order.amount_settled__rs__
              : profitLossData.total_realizable_amount;
          profitLossData.income_tax_credits =
            order.line_item === 'Income Tax Credits (C)'
              ? order.amount_settled__rs__
              : profitLossData.income_tax_credits;
        }
        await ProfitLoss.create(profitLossData);
      } else if (sheetName === 'Orders') {
        orders = Array.from([]);
        sheets = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[2]], { header: 0, range: 1 });
        for (let i = 1; i < sheets.length; i += 1) {
          let sheetData = sheets[i];

          // Header Title Remove space and special character:
          const orderData: any = Object.entries(sheetData).reduce((acc, curr) => {
            let [key, value] = curr;
            // Checking if the key is a string
            acc[typeof key === 'string' ? key.trim().toLowerCase().replace(/[\W_]/g, '_') : key] = value;
            return acc;
          }, {});
          orders.push(orderData);
        }
        const orderDetails = [];
        for (const order of orders) {
          const findOrderData = await SheetOrder.findOne({ flipkart_order_id: order.order_id });
          if (!findOrderData) {
            const orderInsertData = {
              order_id: generatePublicId(),
              neft_id: order.neft_id,
              neft_type: order.neft_type,
              payment_date: convertIntoUnix(order.payment_date).toString(),
              bank_settlement_value_rs_sum: order.bank_settlement_value__rs_______sum_j_r_,
              input_gst_tcs_credits_rs_gst_tcs: order.input_gst___tcs_credits__rs_____gst_tcs_,
              income_tax_credits_rs_tds: order.income_tax_credits__rs_____tds_,
              flipkart_order_id: order.order_id,
              order_item_id: order.order_item_id,
              sale_amount_rs: order.sale_amount__rs__,
              total_offer_amount_rs: order.total_offer_amount__rs__,
              my_share_rs: order.my_share__rs__,
              customer_add_ons_amount_rs: order.customer_add_ons_amount__rs__,
              marketplace_fee_rs_sum_v_ai: order.marketplace_fee__rs______sum__v_ai_,
              taxes_rs: order.taxes__rs__,
              offer_adjustments_rs: order.offer_adjustments__rs__,
              protection_fund_rs: order.protection_fund__rs__,
              refund_rs: order.refund__rs__,
              tier: order.tier,
              commission_rate: order.commission_rate____,
              commission_rs: order.commission__rs__,
              fixed_fee_rs: order.fixed_fee___rs__,
              collection_fee_rs: order.collection_fee__rs__,
              pick_and_pack_fee_rs: order.pick_and_pack_fee__rs__,
              shipping_fee_rs: order.shipping_fee__rs__,
              reverse_shipping_fee_rs: order.reverse_shipping_fee__rs__,
              no_cost_emi_fee_reimbursement_rs: order.no_cost_emi_fee_reimbursement_rs__,
              installation_fee_rs: order.installation_fee__rs__,
              tech_visit_fee_rs: order.tech_visit_fee__rs__,
              uninstallation_packaging_fee_rs: order.uninstallation___packaging_fee__rs__,
              customer_add_ons_amount_recovery_rs: order.customer_add_ons_amount_recovery__rs__,
              franchise_fee_rs: order.franchise_fee__rs__,
              shopsy_marketing_fee_rs: order.shopsy_marketing_fee__rs__,
              product_cancellation_fee_rs: order.product_cancellation_fee__rs__,
              tcs_rs: order.tcs__rs__,
              tds_rs: order.tds__rs__,
              gst_on_mp_fees_rs: order.gst_on_mp_fees__rs__,
              offer_amount_settled_as_discount_in_mp_fee_rs: order.offer_amount_settled_as_discount_in_mp_fee__rs__,
              item_gst_rate: order.item_gst_rate____,
              discount_in_mp_fees_rs_ao_1_ap_100: order.discount_in_mp_fees__rs______ao__1_ap_100__,
              gst_on_discount_rs_18_aq: order.gst_on_discount__rs______18__aq_,
              total_discount_in_mp_fee_rs_aq_ar: order.total_discount_in_mp_fee__rs______aq___ar_,
              offer_adjustment_rs_as_ao: order.offer_adjustment__rs______as_ao_,
              dead_weight_kgs: order.dead_weight__kgs_,
              length_breadth_height: order.length_breadth_height,
              volumetric_weight_kgs: order.volumetric_weight__kgs_,
              chargeable_weight_source: order.chargeable_weight_source,
              chargeable_weight_type: order.chargeable_weight_type,
              chargeable_wt_slab_in_kgs: order.chargeable_wt__slab__in_kgs_,
              shipping_zone: order.shipping_zone,
              order_date: convertIntoUnix(order.order_date).toString(),
              dispatch_date: convertIntoUnix(order.dispatch_date).toString(),
              fulfilment_type: order.fulfilment_type,
              seller_sku: order.seller_sku,
              quantity: order.quantity,
              product_sub_category: order.product_sub_category,
              additional_information: order.additional_information,

              return_type:
                // eslint-disable-next-line no-nested-ternary
                order.additional_information === 'REPLACEMENT_ITEM'
                  ? 'replacement'
                  : order.return_type === 'NA'
                  ? 'completed'
                  : order.return_type,
              shopsy_order: order.shopsy_order,
              item_return_status: order.item_return_status,
              invoice_id: order.invoice_id,
              invoice_date: order.invoice_date === 'NA' ? '' : convertIntoUnix(order.invoice_date).toString(),
              sale_amount_invoice: order.my_share,
              total_offer_amount_invoice: order.total_offer_amount,
              my_share: order.my_share,
              created_at: setTimesTamp(),
              flipkart_account_by: flipkartAccount.platform_id,
              created_by: userId,
            };
            orderDetails.push(orderInsertData);
          }
        }
        await SheetOrder.insertMany(orderDetails);
      }
    }
    // console.log('orders', orders)

    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.CREATED, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
