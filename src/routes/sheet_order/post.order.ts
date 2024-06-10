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
import ReturnOrder from '../../model/return_order.model';

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
    for (const sheetName of sheetNameList) {
      if (sheetName === 'Table 1') {
        continue; // Skip 'Table 1'
      }
      let parsedData = {};
      if (sheetName === 'Table 2') {
        const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetName], { header: 1, range: 0 });
        // Split the string into lines
        // Extract the string from the list
        let dataStr: any = orderDetails[0];
        let lines = dataStr[0].split('\n');
        // Initialize an empty object to store the parsed data

        // Parse the first line (Courier information)
        let courierInfo = lines[0].split(':');

        parsedData['Courier'] = courierInfo[1].trim();

        // Parse the second line (Supplier Name and Date)
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
          // Header Title Remove space and special character:
          const orderData: any = Object.entries(sheetObject).reduce((acc, curr) => {
            let [key, value] = curr;
            // Checking if the key is a string
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
          // Header Title Remove space and special character:
          const orderData: any = Object.entries(sheetObject).reduce((acc, curr) => {
            let [key, value] = curr;
            // Checking if the key is a string
            acc[typeof key === 'string' ? key.trim().toLowerCase().replace(/[\W_]/g, '_') : key] = value;
            return acc;
          }, {});
          orders.push(orderData);
        }
      }
      const orderDetails = [];
      for (const order of orders) {
        const findOrderData = await Order.findOne({ sub_order_no: order.sub_order_no_ });
        if (!findOrderData) {
          const orderInsertData = {
            order_id: generatePublicId(),
            sub_order_no: order.sub_order_no_,
            awb: order.awb,
            sku: order.sku,
            qty: order.qty_,
            size: order.size,
            courier: order.courier,
            order_date: order.date,
            supplier_name: order.supplier_name,
            account_id: order.account_id,
            created_at: setTimesTamp(),
          };
          orderDetails.push(orderInsertData);
        }
      }
      await Order.insertMany(orderDetails);
    }
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, ORDER.CREATED, false));
  } catch (error) {
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
    const accountDetails = await sellerAccounts.findOne({ account_name: accountName });
    if (!accountDetails) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, 'account not found', true));
    }
    const file = XLSX.read(fileLocation);
    const sheetNameList: any = file.SheetNames;
    const orderDetails = XLSX.utils.sheet_to_json(file.Sheets[sheetNameList[0]], { header: 7, range: 7 });
    const orderD = [];
    for (const order of orderDetails) {
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
