/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/dot-notation */
import XLSX from 'xlsx';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { ITokenData } from '../../services/common.types';
import { convertIntoUnix, generatePublicId, setTimesTamp, setTimesTampNano } from '../../common/common-function';
import { jsonCleaner, responseGenerators } from '../../lib';
import { ERROR, ORDER } from '../../common/global-constants';
import sellerAccounts from '../../model/seller_accounts.model';
import Order from '../../model/sheet_order.model';
import PaymentOrders from '../../model/payment_order.model';
import { convertPdfToExcel, getExcelFileByUrl } from '../../helpers/excel/convertPdfToExcel';
import ReturnOrder from '../../model/return_order.model';
// import { storeFile } from '../../firebase';

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

function isSubstringInArray(substring: string, array: string[] = []): boolean {
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

function cleanString(str: string): string {
  return str.replace(/\s+/g, '').toLowerCase();
}

export const uploadOrderSheetHandler = async (req: Request, res: Response) => {
  try {
    const fileLocation: any = req.file?.buffer;
    const { account_name: accountName } = req.body;
    const tokenData = (req.headers as any).tokenData as ITokenData;
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

    const file = XLSX.read(excelFile);
    const sheetNameList = file.SheetNames;

    for (const sheetName of sheetNameList) {
      const headerSheet = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 1, range: 0 });

      let dataStr: any = headerSheet[0];
      if (!(isSubstringInArray('Picklist', dataStr) || isSubstringInArray('Courier', dataStr))) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(responseGenerators({}, StatusCodes.BAD_REQUEST, 'Only the order pdf is allowed for upload', true));
      }
    }

    // const sheetId = generatePublicId();
    // try {
    //   await storeFile({
    //     file: excelFile,
    //     fileName: `${accountName}_${sheetId}.xlsx`,
    //     contentType: 'auto',
    //     location: 'orders',
    //   });
    // } catch (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error);
    // }

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

      parsedData['Courier'] = courierInfo?.trim();
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
        user_id: tokenData?.user_id,
        is_deleted: false,
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
            sub_order_no: order?.sub_order_no_,
            awb_number: order?.awb?.toString(),
            awb: order.awb,
            sku: order.sku,
            qty: order.qty_,
            size: order.size,
            pickup_courier_partner: order.courier,
            order_date: convertIntoUnix(order.date),
            supplier_name: order.supplier_name,
            account_id: sellerAccount.platform_id,
            created_at: setTimesTampNano(),
            sheetId: order?.sheet_id,
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
    const { account_name: accountName } = req.body;
    const accountDetails: any = await sellerAccounts.findOne({ account_name: accountName }).lean();
    if (!accountDetails) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'account not found', true));
    }
    const zipFilePath = req.file.buffer;
    const extractedPath = path.join(__dirname, 'uploads', req.file.originalname);
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractedPath, true);
    const files = fs.readdirSync(extractedPath);
    const file = XLSX.readFile(path.join(extractedPath, files[0]));
    const sheetNameList: any = file.SheetNames;

    const [firstSheetName] = sheetNameList ?? [];
    if (cleanString(firstSheetName) !== 'orderpayments') {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, 'Only the payment sheet is allowed for upload', true));
    }

    const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[0]], {
      header: 0,
      range: 1,
    });
    let orderD = [];

    const subOrderNumber = orderDetails[2]['Sub Order No'];
    // const foundOrder: any = await Order.find({ sub_order_no: subOrderNumber });

    // if (foundOrder.supplier_name !== accountName) {
    //   return res
    //     .status(StatusCodes.BAD_REQUEST)
    //     .send(
    //       responseGenerators({}, StatusCodes.BAD_REQUEST, `The payment sheet does not belong to ${accountName}`, true),
    //     );
    // }

    const paymentOrderData = await PaymentOrders.findOne({ subOrderNo: subOrderNumber });

    if (paymentOrderData) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.OK, 'payment sheet already added', true));
    }

    const sheetId = generatePublicId();
    // try {
    //   await storeFile({
    //     file: fileLocation,
    //     fileName: `${accountName}_${sheetId}.xlsx`,
    //     contentType: 'auto',
    //     location: 'Payment',
    //   });
    // } catch (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error);
    // }

    for (const data of orderDetails) {
      if (!data['Sub Order No']) continue;
      const paymentOrderObj: any = {
        subOrderNo: data['Sub Order No']?.trim(),
        orderDate: !data['Order Date'] ? null : convertIntoUnix(data['Order Date'])?.toString(),
        dispatchDate: !data['Dispatch Date'] ? null : convertIntoUnix(data['Dispatch Date'])?.toString(),
        productName: data['Product Name'],
        supplierSKU: data['Supplier SKU'],
        liveOrderStatus: data['Live Order Status'],
        productGSTPercent: parseFloat(data['Product GST %'])?.toString(),
        listingPriceInclGSTAndCommission: parseFloat(data['Listing Price (Incl. GST & Commission)'])?.toString(),
        quantity: parseInt(data['Quantity'], 10),
        transactionID: data['Transaction ID'],
        paymentDate: !data['Order Date'] ? null : convertIntoUnix(data['Payment Date'])?.toString(),
        finalSettlementAmount: parseFloat(data['Final Settlement Amount']),
        priceType: data['Price Type'],
        totalSaleAmountInclCommissionAndGST: data['Total Sale Amount (Incl. Commission & GST)']?.toString(),
        saleReturnAmountInclGST: data['Sale Return Amount (Incl. GST)'].toString(),
        fixedFeeInclGST: data['Fixed Fee (Incl. GST)'].toString(),
        warehousingFeeInclGST: data['Warehousing fee (inc Gst)'].toString(),
        shippingRevenueInclGST: data['Shipping Revenue (Incl. GST)'].toString(),
        shippingReturnAmountInclGST: data['Shipping Return Amount (Incl. GST)'].toString(),
        returnPremiumInclGST: data['Return premium (incl GST)'].toString(),
        returnPremiumOfReturnInclGST: data['Return premium (incl GST) of Return'].toString(),
        meeshoCommissionPercentage: data['Meesho Commission Percentage'].toString(),
        meeshoCommissionExclGST: data['Meesho Commission (Excl. GST)'].toString(),
        meeshoGoldPlatformFeeExclGST: data['Meesho gold platform fee (excl GST)'].toString(),
        meeshoMallPlatformFeeExclGST: data['Meesho mall platform fee (excl. GST)'].toString(),
        fixedFeeExclGST: data['Fixed Fee (excl. GST)'].toString(),
        warehousingFeeExclGST: data['Warehousing fee (excl Gst)'].toString(),
        returnShippingChargeExclGST: data['Return Shipping Charge (Excl. GST)'].toString(),
        gstCompensationPRPShipping: data['GST Compensation (PRP Shipping)'].toString(),
        shippingChargeExclGST: data['Shipping Charge (Excl. GST)'].toString(),
        otherSupportServiceChargesExclGST: data['Other Support Service Charges (Excl. GST)'].toString(),
        waiversExclGST: data['Waivers (Excl. GST)'].toString(),
        netOtherSupportServiceChargesExclGST: data['Net Other Support Service Charges (Excl. GST)'].toString(),
        gstOnMeeshoCommission: data['GST on Meesho Commission'].toString(),
        gstOnWarehousingFee: data['GST on Warehousing fee'].toString(),
        gstOnMeeshoGold: data['GST on meesho gold'].toString(),
        gstOnMeeshoMallPlatformFee: data['GST on Meesho Mall platform fee'].toString(),
        gstOnShippingCharge: data["GST on Shipping Charge', 'CGST + SGST on Shipping Charge"].toString(),
        cgstSGSTOnShippingCharge: data["GST on Shipping Charge', 'CGST + SGST on Shipping Charge"].toString(),
        gstOnReturnShippingCharge: data['GST on Return Shipping Charge'].toString(),
        gstOnNetOtherSupportServiceCharges: data['GST on Net Other Support Service Charges'].toString(),
        gstOnFixedFee: data['GST on Fixed Fee'].toString(),
        tcs: data['TCS'].toString(),
        tdsRatePercent: data['TDS Rate %'].toString(),
        tds: data['TDS'].toString(),
        compensation: data['Compensation'].toString(),
        claims: data['Claims'].toString(),

        recovery: parseFloat(data['Recovery']),
        compensationReason: data['Compensation Reason'],
        claimsReason: data['Claims Reason'],
        recoveryReason: data['Recovery Reason'],
        sheetId,
      };
      let status = 'completed';
      let isClaim = false;
      let isExchange = false;
      if (paymentOrderObj.liveOrderStatus === 'RTO') {
        status = 'currierReturn';
      }
      if (paymentOrderObj.liveOrderStatus === 'Return') {
        status = 'customerReturn';
        if (paymentOrderObj.shippingChargeExclGST) {
          isExchange = true;
        }
      }
      if (paymentOrderObj.liveOrderStatus === 'Exchange') {
        status = 'exchange';
        if (paymentOrderObj.shippingChargeExclGST) {
          isExchange = true;
        }
      }
      if (paymentOrderObj.liveOrderStatus === 'Shipped') {
        status = 'shipped';
        if (paymentOrderObj.shippingChargeExclGST) {
          isExchange = true;
        }
      }
      if (paymentOrderObj.liveOrderStatus === 'Cancelled') {
        status = 'cancelled';
      }
      if (!paymentOrderObj.liveOrderStatus) {
        isClaim = true;
      }
      const paymentOrderFind = await PaymentOrders.findOne({ subOrderNo: paymentOrderObj.subOrderNo });
      if (paymentOrderFind) {
        await PaymentOrders.findOneAndUpdate(
          { subOrderNo: paymentOrderObj.subOrderNo },
          { $set: { order_status: paymentOrderObj.liveOrderStatus } },
        );

        await Order.findOneAndUpdate(
          {
            sub_order_no: paymentOrderFind.subOrderNo,
          },
          {
            $set: {
              order_status: paymentOrderObj?.liveOrderStatus,
              order_price: paymentOrderObj?.finalSettlementAmount,
              is_claim: paymentOrderObj?.liveOrderStatus ? false : isClaim,
              issue_message:
                status === 'completed' ? '' : 'The payment is done but product is pending delivery to your company',
              is_exchange: isExchange,
            },
          },
        );
      } else {
        await Order.findOneAndUpdate(
          { sub_order_no: paymentOrderObj.subOrderNo },
          {
            $set: {
              order_status: status,
              order_price: String(paymentOrderObj.finalSettlementAmount),
              is_claim: isClaim,
              issue_message:
                status === 'completed' ? '' : 'The payment is done but product is pending delivery to your company',
              is_exchange: isExchange,
            },
          },
        );
        orderD.push({
          insertOne: {
            document: paymentOrderObj,
          },
        });
      }
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
    // const { account_name: accountName } = req.body;

    const sheetId = generatePublicId();
    // try {
    //   await storeFile({
    //     file: fileLocation,
    //     fileName: `${accountName}_${sheetId}.xlsx`,
    //     contentType: 'auto',
    //     location: 'Returns',
    //   });
    // } catch (error) {
    //   // eslint-disable-next-line no-console
    //   console.error(error);
    // }
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
      const findOrderData = await ReturnOrder.findOne({ sub_order_no: order['Suborder Number'] });
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
          sub_order_no: order['Suborder Number'],
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
          sheetId,
        };

        const updateOrder = await Order.findOneAndUpdate(
          { sub_order_no: orderInsertData.sub_order_no },
          {
            $set: {
              awb_number: orderInsertData.awb_number,
              order_status:
                orderInsertData.type_of_return === 'Courier Return (RTO)' ? 'currierReturn' : 'customerReturn',
              return_currier_partner: orderInsertData.courier_partner,
            },
          },
          {
            returnOriginal: false,
          },
        );
        if (updateOrder) {
          orderD.push(orderInsertData);
        }
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
