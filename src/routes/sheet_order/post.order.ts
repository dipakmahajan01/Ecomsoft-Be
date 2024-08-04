/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/dot-notation */
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { convertDateToUnix, convertIntoUnix, generatePublicId, setTimesTamp } from '../../common/common-function';
import { jsonCleaner, responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import sellerAccounts from '../../model/seller_accounts.model';
import Order from '../../model/sheet_order.model';
import PaymentOrders from '../../model/payment_order.model';
import { convertPdfToExcel, getExcelFileByUrl } from '../../helpers/excel/convertPdfToExcel';
import ReturnOrder from '../../model/return_order.model';
import { storeFile } from '../../firebase';

const API_KEY = process.env.PDF_REST_API_KEY;

// function generateFileName(baseName: string): string {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   const hours = String(now.getHours()).padStart(2, '0');
//   const minutes = String(now.getMinutes()).padStart(2, '0');
//   const seconds = String(now.getSeconds()).padStart(2, '0');

//   return `${baseName}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
// }

// function storeBufferAndObject(buffer: Buffer, obj: any, filePath: string): void {
//   // Ensure the directory exists
//   const excelPath = `${filePath + generateFileName('excel')}.xlsx`;
//   const dir = path.dirname(excelPath);
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }

//   // Write the buffer to the specified file path
//   fs.writeFileSync(excelPath, buffer);

//   // Write the object to a JSON file in the same directory
//   const objFilePath = `${filePath + generateFileName('json')}.json`;
//   fs.writeFileSync(objFilePath, JSON.stringify(obj, null, 2));
// }

function isSubstringInArray(substring: string, array: string[]): boolean {
  for (const str of array) {
    if (str?.toLowerCase()?.includes(substring.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function extractValueByKey(input, key) {
  const regex = new RegExp(`${key}\\s*:\\s*([^\\n]*)`, 'i');
  const match = input?.match(regex);
  return match ? match[1].trim() : null;
}

export const uploadOrderSheetHandler = async (req: Request, res: Response) => {
  try {
    const fileLocation: any = req.file.buffer;
    const { account_name: accountName } = req.body;

    let sellerAccount: any = await sellerAccounts.findOne({ account_name: accountName });
    if (!sellerAccount) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'Account not found', true));
    }

    const { isSuccess, data, message } = await convertPdfToExcel(fileLocation, API_KEY);
    if (!isSuccess) {
      return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, message, true));
    }
    const excelFile = await getExcelFileByUrl(data.outputUrl);

    const sheetId = generatePublicId();
    try {
      await storeFile({
        file: excelFile,
        fileName: `${accountName}_${sheetId}.xlsx`,
        contentType: 'auto',
        location: 'orders',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    const file = XLSX.read(excelFile);
    const sheetNameList = file.SheetNames;
    let orders = [];
    // let sheets;
    // let sellerData;
    let orderDetails = [];
    const extractSheetData = {};
    let isSubOrderIdChecked = false;
    for (const sheetName of sheetNameList) {
      const parsedData: any = {};
      const headerSheet = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 1, range: 0 });

      let dataStr: any = headerSheet[0];
      if (isSubstringInArray('Picklist', dataStr)) continue;

      const detailsContainerString = dataStr.join('\n');
      // let lines = dataStr[0].split('\n');
      // let courierInfo = lines[0]?.split(':');
      // let supplierDateInfo = lines[1]?.split('Date :');
      // // TODO :- Undidine error, Need to handle the undifined data and parse properly.
      // let supplierName = supplierDateInfo[0]?.split(':')[1]?.trim();
      // let date = supplierDateInfo[1]?.trim();
      const supplierName = extractValueByKey(detailsContainerString, 'Supplier Name');
      const date = extractValueByKey(detailsContainerString, 'Date');
      const courierInfo = extractValueByKey(detailsContainerString, 'Courier');

      parsedData['Courier'] = courierInfo[1]?.trim();
      parsedData['Supplier Name'] = supplierName;
      parsedData['date'] = date;
      sellerAccount.sheet_account_name = supplierName.trim().split(' ').join('').toLowerCase().toLowerCase();

      await sellerAccount.save();
      const accountDetails = await sellerAccounts.findOne({
        sheet_account_name:
          sellerAccount.account_name.trim().split(' ').join('').toLowerCase() ===
          supplierName.trim().split(' ').join('').toLowerCase().toLowerCase()
            ? supplierName.trim().split(' ').join('').toLowerCase().toLowerCase()
            : '',
      });
      const accountId: any = accountDetails?.platform_id;

      if (sellerAccount.platform_id !== accountId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators(
              {},
              StatusCodes.BAD_REQUEST,
              'Provided sheet does not match the selected account. Please select the correct account',
              true,
            ),
          );
      }

      parsedData['account_id'] = accountId;

      const sheets = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 2, range: 1 });
      const cleanSheetData = jsonCleaner(sheets);

      const orderId = cleanSheetData[0]['Sub Order No.']?.replace(/\r\n/g, '');

      if (!isSubOrderIdChecked) {
        const findOrderDetails = await Order.findOne({ sub_order_no: orderId });
        if (findOrderDetails) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send(responseGenerators({}, StatusCodes.BAD_REQUEST, 'Order sheet already added', true));
        }
        isSubOrderIdChecked = true;
      }
      // let parsedData = {};
      orders = Array.from([]);
      // sheets = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 2, range: 1 });
      for (let i = 0; i < cleanSheetData.length; i += 1) {
        let sheetData: any = cleanSheetData[i];
        const sheetObject = { ...sheetData, ...parsedData };
        const orderData: any = Object.entries(sheetObject).reduce((acc, curr) => {
          let [key, value] = curr;
          acc[
            typeof key === 'string'
              ? key
                  .trim()
                  .toLowerCase()
                  .replace(/[\W_]/g, '_')
                  .replace(/\r?\n|\r/g, '')
              : key
          ] = value;
          return acc;
        }, {});
        orders.push(orderData);
      }

      extractSheetData[sheetName] = { parsedData, sheets: cleanSheetData };
      for (const order of orders) {
        const orderId = order.sub_order_no_.replace(/\r\n/g, '');
        if (!orderId?.trim()) continue;
        const findOrderData = await Order.findOne({ sub_order_no: orderId || '' });
        if (!findOrderData) {
          const orderInsertData = {
            order_id: generatePublicId(),
            sub_order_no: order.sub_order_no_,
            awb: order.awb,
            sku: order.sku,
            qty: order.qty_,
            size: order.size,
            pickup_courier_partner: order.courier,
            order_date: order.date,
            supplier_name: order.supplier_name,
            account_id: sellerAccount.platform_id,
            created_at: setTimesTamp(),
            sheetId: order.sheet_id,
          };
          orderDetails.push({
            insertOne: {
              document: orderInsertData,
            },
          });
        }
      }
    }
    // const sheetData = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[1]], { header: 2, range: 1 });
    // const removeNewlinesFromJsonData = jsonCleaner(extractSheetData);
    await Order.bulkWrite(orderDetails);
    // storeBufferAndObject(excelFile, { removeNewlinesFromJsonData, orderDetails }, 'demoUpload');
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.CREATED, false));
  } catch (error) {
    // eslint-disable-next-line no-console
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
    const accountDetails: any = await sellerAccounts.findOne({ account_name: accountName }).lean();
    if (!accountDetails) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'account not found', true));
    }

    const sheetId = generatePublicId();
    try {
      await storeFile({
        file: fileLocation,
        fileName: `${accountName}_${sheetId}.xlsx`,
        contentType: 'auto',
        location: 'Payment',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    const file = XLSX.read(fileLocation);
    const sheetNameList: any = file.SheetNames;
    const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[0]], {
      header: 0,
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
      if (data[0]) continue;
      const paymentOrderObj: any = {
        subOrderNo: data['Sub Order No']?.trim(),
        orderDate: !data['Order Date'] ? null : convertIntoUnix(data['Order Date'])?.toString(),
        dispatchDate: !data['Dispatch Date'] ? null : convertIntoUnix(data['Dispatch Date'])?.toString(),
        productName: data['Product Name'],
        supplierSKU: data['Supplier SKU'],
        liveOrderStatus: data['Live Order Status'],
        productGSTPercent: parseFloat(data['Product GST %']),
        listingPriceInclGSTAndCommission: parseFloat(data['Listing Price (Incl. GST & Commission)']),
        quantity: parseInt(data['Quantity'], 10),
        transactionID: data['Transaction ID'],
        paymentDate: !data['Order Date'] ? null : convertIntoUnix(data['Payment Date'])?.toString(),
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
        sheetId,
      };
      let status = 'completed';
      if (paymentOrderObj.liveOrderStatus === 'RTO' || paymentOrderData?.finalSettlementAmount === 0.0) {
        status = 'currierReturn';
      }
      if (paymentOrderObj.liveOrderStatus === 'Return') {
        status = 'customerReturn';
      }
      if (paymentOrderObj.liveOrderStatus === 'Exchange') {
        status = 'exchange';
      }
      if (paymentOrderObj.liveOrderStatus === 'Shipped') {
        status = 'shipped';
      }
      if (paymentOrderObj.liveOrderStatus === 'Cancelled') {
        status = 'cancelled';
      }
      const findOrderData = await Order.findOne({ sub_order_no: paymentOrderObj.subOrderNo });
      if (!findOrderData) {
        await Order.create({
          order_id: generatePublicId(),
          sub_order_no: paymentOrderObj?.subOrderNo,
          awb: paymentOrderObj?.awb_number,
          sku: paymentOrderObj?.sku,
          qty: paymentOrderObj?.Qty,
          size: '',
          pickup_courier_partner: paymentOrderObj?.courier_partner,
          order_date: paymentOrderObj?.orderDate,
          supplier_name: accountDetails?.account_name,
          account_id: accountDetails?.platform_id,
          created_at: convertDateToUnix(paymentOrderObj?.order_date),
          status,
          is_return_updated: true,
          is_order_issue: false,
        });
      }
      await Order.findOneAndUpdate(
        { sub_order_no: data['Sub Order No']?.trim(), is_return_update: true },
        { $set: { order_status: status, order_price: String(paymentOrderObj.finalSettlementAmount) } },
      );
      await Order.findOneAndUpdate(
        { sub_order_no: data['Sub Order No']?.trim(), is_return_update: false },
        {
          $set: {
            order_status: status,
            order_price: String(paymentOrderObj.finalSettlementAmount),
            issue_message:
              status === 'completed' ? '' : 'The payment is done but product is pending delivery to your company',
          },
        },
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
    // eslint-disable-next-line no-console
    console.log('error', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
export const returnOrder = async (req: Request, res: Response) => {
  try {
    const fileLocation: any = req.file.buffer;
    const { account_name: accountName } = req.body;
    const accountDetails: any = await sellerAccounts.findOne({ account_name: accountName });
    if (!accountDetails) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'account not found', true));
    }
    const file = XLSX.read(fileLocation);
    const sheetNameList: any = file.SheetNames;
    const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[0]]);
    let headerRange: number;
    for (let index = 0; index < orderDetails.length; index += 1) {
      const element = orderDetails[index]['Meesho Supplier Panel'] === 1 || orderDetails[index]['__EMPTY'] === 1;
      if (element) {
        headerRange = index + 1;
        break;
      }
    }
    const orders = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[0]], { header: headerRange, range: headerRange });
    const orderD = [];
    for (const order of orders) {
      const findOrderData = await ReturnOrder.findOne({ suborder_number: order['Suborder Number'] });
      if (!findOrderData) {
        const orderInsertData = {
          return_order_id: generatePublicId(),
          product_name: order['Product Name'],
          sku: order['SKU'],
          variation: order['Variation'],
          meesho_pid: order['Meesho PID'],
          Qty: order['Qty'],
          category: order['Order Number'],
          order_number: order['Order Number'],
          suborder_number: order['Suborder Number'],
          order_date: order['Order Date'],
          dispatch_date: order['Dispatch Date'],
          return_created_date: order['Return Created Date'],
          type_of_return: order['Type of Return'],
          sub_type: order['Sub Type'],
          expected_delivery_date: order['Expected Delivery Date'],
          courier_partner: order['Courier Partner'],
          awb_number: order['AWB Number'],
          status: order['Status'],
          attempt: order['Attempt'],
          tracking_link: order['Tracking Link'],
          return_reason: order['Return Reason'],
          detailed_return_reason: order['Detailed Return Reason'],
          created_at: setTimesTamp(),
        };
        const findOrderData = await Order.findOne({ sub_order_no: orderInsertData.suborder_number });
        if (!findOrderData) {
          await Order.create({
            order_id: generatePublicId(),
            sub_order_no: orderInsertData.suborder_number,
            awb: orderInsertData.awb_number,
            sku: orderInsertData.sku,
            qty: orderInsertData.Qty,
            size: '',
            pickup_courier_partner: orderInsertData.courier_partner,
            order_date: convertDateToUnix(orderInsertData.order_date),
            supplier_name: accountDetails.account_name,
            account_id: accountDetails.platform_id,
            created_at: setTimesTamp(),
            order_status:
              orderInsertData.type_of_return === 'Courier Return (RTO)' ? 'currierReturn' : 'customerReturn',
            is_return_update: true,
            is_order_issue: false,
          });
        }
        await Order.findOneAndUpdate(
          { sub_order_no: orderInsertData.suborder_number },
          {
            $set: {
              awb_number: orderInsertData.awb_number,
              order_status:
                orderInsertData.type_of_return === 'Courier Return (RTO)' ? 'currierReturn' : 'customerReturn',
              return_currier_partner: orderInsertData.courier_partner,
            },
          },
        );

        orderD.push(orderInsertData);
      }
    }
    const data = await ReturnOrder.insertMany(orderD);
    return res.status(StatusCodes.OK).send(responseGenerators(data, StatusCodes.OK, ORDER.CREATED, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, false));
  }
};
