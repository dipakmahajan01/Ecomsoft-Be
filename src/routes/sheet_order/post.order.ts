/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-console */
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { generatePublicId, setTimesTamp } from '../../common/common-function';
import { responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import sellerAccounts from '../../model/seller_accounts.model';
import Order from '../../model/sheet_order.model';
import PaymentOrders from '../../model/payment_order.model';

export const uploadOrderSheetHandler = async (req: Request, res: Response) => {
  try {
    const fileLocation: any = req.file.buffer;
    const { account_name: accountName } = req.body;

    const file = XLSX.read(fileLocation);
    const sheetNameList = file.SheetNames;
    let orders = [];
    let sheets;
    const flipkartAccount = await sellerAccounts.findOne({ account_name: accountName });
    if (!flipkartAccount) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'Account not found', true));
    }
    let sellerData;
    const sheetData = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[1]], { header: 2, range: 1 });
    const orderId = sheetData[0]['Sub Order No.']?.replace(/\r\n/g, '');
    const findOrderDetails = await Order.findOne({ sub_order_no: orderId });
    if (findOrderDetails) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, 'Order sheet already added', true));
    }
    const orderDetails = [];
    for (const sheetName of sheetNameList) {
      if (sheetName === 'Table 1') {
        continue; // Skip 'Table 1'
      }
      let parsedData = {};
      if (sheetName === 'Table 2') {
        const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 1, range: 0 });

        let dataStr: any = orderDetails[0];
        let lines = dataStr[0].split('\n');
        let courierInfo = lines[0].split(':');

        parsedData['Courier'] = courierInfo[1].trim();
        let supplierDateInfo = lines[1].split('Date :');
        let supplierName = supplierDateInfo[0].split(':')[1].trim();
        let date = supplierDateInfo[1].trim();
        // Store in the object
        parsedData['Supplier Name'] = supplierName;
        parsedData['date'] = date;
        const accountId: any = (
          await sellerAccounts.findOne({
            account_name: parsedData['Supplier Name'],
          })
        ).platform_id;
        parsedData['account_id'] = accountId;
        orders = Array.from([]);
        sheets = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 2, range: 1 });
        for (let i = 0; i < sheets.length; i += 1) {
          let sheetData = sheets[i];
          const sheetObject = { ...sheetData, ...parsedData };
          const orderData: any = Object.entries(sheetObject).reduce((acc, curr) => {
            let [key, value] = curr;
            acc[typeof key === 'string' ? key.trim().toLowerCase().replace(/[\W_]/g, '_') : key] = value;
            return acc;
          }, {});
          orders.push(orderData);
        }
        sellerData = parsedData;
      } else {
        orders = Array.from([]);
        sheets = XLSX.utils.sheet_to_json(file.Sheets[sheetName]);
        for (let i = 0; i < sheets.length; i += 1) {
          let sheetData = sheets[i];
          const sheetObject = { ...sheetData, ...sellerData };
          const orderData: any = Object.entries(sheetObject).reduce((acc, curr) => {
            let [key, value] = curr;
            acc[typeof key === 'string' ? key.trim().toLowerCase().replace(/[\W_]/g, '_') : key] = value;
            return acc;
          }, {});
          orders.push(orderData);
        }
      }
      for (const order of orders) {
        const findOrderData = await Order.findOne({ sub_order_no: order.sub_order_no_.replace(/\r\n/g, '') });
        if (!findOrderData) {
          const orderInsertData = {
            order_id: generatePublicId(),
            sub_order_no: order.sub_order_no_.replace(/\r\n/g, ''),
            awb: order.awb,
            sku: order.sku,
            qty: order.qty_,
            size: order.size,
            courier: order.courier,
            order_date: order.date,
            supplier_name: order.supplier_name,
            account_id: flipkartAccount.platform_id,
            created_at: setTimesTamp(),
          };
          orderDetails.push({
            insertOne: {
              document: orderInsertData,
            },
          });
        }
      }
    }
    await Order.bulkWrite(orderDetails);
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.CREATED, false));
  } catch (error) {
    console.log('error', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};

export const paymentOrderUpload = async (req: Request, res: Response) => {
  try {
    const fileLocation: any = req.file.buffer;
    const { account_name: accountName } = req.body;
    const accountDetails = await sellerAccounts.findOne({ account_name: accountName });
    if (!accountDetails) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'account not found', true));
    }
    const file = XLSX.read(fileLocation);
    const sheetNameList: any = file.SheetNames;
    const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[0]], {
      header: 2,
      range: 1,
    });
    let orderD = [];
    const paymentOrderData = await PaymentOrders.findOne({ subOrderNo: orderDetails[2]['Sub Order No'] });
    if (paymentOrderData) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.OK, 'payment sheet already added', true));
    }
    for (const data of orderDetails) {
      const paymentOrderObj = {
        subOrderNo: data['Sub Order No'],
        orderDate: new Date(data['Order Date']),
        dispatchDate: new Date(data['Dispatch Date']),
        productName: data['Product Name'],
        supplierSKU: data['Supplier SKU'],
        liveOrderStatus: data['Live Order Status'],
        productGSTPercent: parseFloat(data['Product GST %']),
        listingPriceInclGSTAndCommission: parseFloat(data['Listing Price (Incl. GST & Commission)']),
        quantity: parseInt(data['Quantity'], 10),
        transactionID: data['Transaction ID'],
        paymentDate: new Date(data['Payment Date']),
        finalSettlementAmount: parseFloat(data['Final Settlement Amount']),
        priceType: data['Price Type'],
        totalSaleAmountInclCommissionAndGST: parseFloat(data['Total Sale Amount (Incl. Commission & GST)']),
        saleReturnAmountInclGST: parseFloat(data['Sale Return Amount (Incl. GST)']),
        fixedFeeInclGST: parseFloat(data['Fixed Fee (Incl. GST)']),
        warehousingFeeInclGST: parseFloat(data['Warehousing fee (inc Gst)']),
        shippingRevenueInclGST: parseFloat(data['Shipping Revenue (Incl. GST)']),
        shippingReturnAmountInclGST: parseFloat(data['Shipping Return Amount (Incl. GST)']),
        returnPremiumInclGST: parseFloat(data['Return premium (incl GST)']),
        returnPremiumOfReturnInclGST: parseFloat(data['Return premium (incl GST) of Return']),
        meeshoCommissionPercentage: parseFloat(data['Meesho Commission Percentage']),
        meeshoCommissionExclGST: parseFloat(data['Meesho Commission (Excl. GST)']),
        meeshoGoldPlatformFeeExclGST: parseFloat(data['Meesho gold platform fee (excl GST)']),
        meeshoMallPlatformFeeExclGST: parseFloat(data['Meesho mall platform fee (excl. GST)']),
        fixedFeeExclGST: parseFloat(data['Fixed Fee (excl. GST)']),
        warehousingFeeExclGST: parseFloat(data['Warehousing fee (excl Gst)']),
        returnShippingChargeExclGST: parseFloat(data['Return Shipping Charge (Excl. GST)']),
        gstCompensationPRPShipping: parseFloat(data['GST Compensation (PRP Shipping)']),
        shippingChargeExclGST: parseFloat(data['Shipping Charge (Excl. GST)']),
        otherSupportServiceChargesExclGST: parseFloat(data['Other Support Service Charges (Excl. GST)']),
        waiversExclGST: parseFloat(data['Waivers (Excl. GST)']),
        netOtherSupportServiceChargesExclGST: parseFloat(data['Net Other Support Service Charges (Excl. GST)']),
        gstOnMeeshoCommission: parseFloat(data['GST on Meesho Commission']),
        gstOnWarehousingFee: parseFloat(data['GST on Warehousing fee']),
        gstOnMeeshoGold: parseFloat(data['GST on meesho gold']),
        gstOnMeeshoMallPlatformFee: parseFloat(data['GST on Meesho Mall platform fee']),
        gstOnShippingCharge: parseFloat(data["GST on Shipping Charge', 'CGST + SGST on Shipping Charge"]),
        cgstSGSTOnShippingCharge: parseFloat(data["GST on Shipping Charge', 'CGST + SGST on Shipping Charge"]),
        gstOnReturnShippingCharge: parseFloat(data['GST on Return Shipping Charge']),
        gstOnNetOtherSupportServiceCharges: parseFloat(data['GST on Net Other Support Service Charges']),
        gstOnFixedFee: parseFloat(data['GST on Fixed Fee']),
        tcs: parseFloat(data['TCS']),
        tdsRatePercent: parseFloat(data['TDS Rate %']),
        tds: parseFloat(data['TDS']),
        compensation: parseFloat(data['Compensation']),
        claims: parseFloat(data['Claims']),
        recovery: parseFloat(data['Recovery']),
        compensationReason: data['Compensation Reason'],
        claimsReason: data['Claims Reason'],
        recoveryReason: data['Recovery Reason'],
      };
      let status = 'completed';
      if (paymentOrderObj.liveOrderStatus === 'RTO') {
        status = 'currierReturn';
      }
      if (paymentOrderObj.liveOrderStatus === 'Return') {
        status = 'customerReturn';
      }
      await Order.findOneAndUpdate(
        { sub_order_no: data['Sub Order No'] },
        { $set: { order_status: status, order_price: String(paymentOrderObj.finalSettlementAmount) } },
      );
      orderD.push({
        insertOne: {
          document: paymentOrderObj,
        },
      });
    }
    orderD.shift();
    await PaymentOrders.bulkWrite(orderD);
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.CREATED, false));
  } catch (error) {
    console.log('error', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
