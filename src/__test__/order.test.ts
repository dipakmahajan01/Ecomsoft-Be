import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import { cloneDeep, filter, find, flatMap, isEmpty, remove } from 'lodash';
import app from '../index';
import {
  Order as OrderType,
  orderTestData,
  PAYMENT_CSV_KEY_MAPPING,
  paymentTestData,
  RETURN_CSV_KEY_MAPPING,
  returnTestData,
  Payment,
  cancelOrderIds,
  scanReturnIds,
} from './TestingData/testData';
import {
  compareObjects,
  ComparisonResult,
  connectTestDB,
  getURL,
  orderStrictFields,
  orderTypeFields,
  paymentStrictFields,
  paymentTypeFields,
  returnStrictFields,
  returnTypeFields,
  storeTestError,
  TypeField,
} from './common';
import Order from '../model/sheet_order.model';
import ReturnOrder from '../model/return_order.model';
import PaymentOrders from '../model/payment_order.model';
import { convertIntoUnix, date15DaysAgo } from '../common/common-function';
import { createIssueOrder } from '../services/messoIssueOrder';

let isLoggingEnabled = false;

// eslint-disable-next-line no-console
const originalConsoleLog = console.log;

const log = (...rest) => {
  if (isLoggingEnabled) {
    originalConsoleLog(...rest);
  }
};

// Extend Jest with custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchObjectStrictly(
        testData: Record<string, any>[],
        strictFields: string[],
        typeFields: TypeField[],
        accessKey?: string,
      ): R;
      toHaveDuplicates(testData: Record<string, any>[], key: string);
    }
  }
}

// const mapStatus = {
//   RTO: 'currierReturn',
//   Return: 'customerReturn',
//   Exchange: 'exchange',
//   Shipped: 'shipped',
//   Cancelled: 'cancelled',
//   Delivered: 'completed',
// };

const globalState = {
  _paymentDataBySuborderId: {},
  _cancelOrdersList: cloneDeep(cancelOrderIds),
  _orderTestData: cloneDeep(orderTestData),
  _paymentTestData: cloneDeep(paymentTestData),
  _returnTestData: cloneDeep(returnTestData),
  _scanReturns: cloneDeep(scanReturnIds),

  get paymentDataBySuborderId() {
    return this._paymentDataBySuborderId;
  },

  get cancelOrderList() {
    return this._cancelOrdersList;
  },

  get orderTestData() {
    return this._orderTestData;
  },

  get paymentTestData() {
    let keyMappedData = cloneDeep(this._paymentTestData).map((rtn) => {
      const entries = Object.entries(rtn).map(([key, value]) => {
        const mappedKey = PAYMENT_CSV_KEY_MAPPING[key];
        if (mappedKey) {
          return [mappedKey, value];
        }
        return [key, value];
      });

      const returnData = Object.fromEntries(entries);
      returnData.created_at = 'CREATED_DATE';
      // Data processing
      returnData.finalSettlementAmount = parseFloat(returnData.finalSettlementAmount);
      returnData.orderDate = convertIntoUnix(returnData.orderDate).toString();
      returnData.paymentDate = convertIntoUnix(returnData.paymentDate).toString();
      returnData.recovery = parseFloat(returnData.recovery).toString();

      return returnData;
    });
    return keyMappedData;
  },

  get returnTestData() {
    let keyMappedData = cloneDeep(this._returnTestData).map((rtn) => {
      const entries = Object.entries(rtn).map(([key, value]) => {
        const mappedKey = RETURN_CSV_KEY_MAPPING[key];
        if (mappedKey) {
          return [mappedKey, value];
        }
        return [key, value];
      });

      const returnData = Object.fromEntries(entries);
      returnData.create_at = 'CREATED_DATE';
      returnData.return_order_id = 'STRING_VALUE';
      returnData.awb_number = Number(returnData.awb_number) ? Number(returnData.awb_number) : returnData.awb_number;
      return returnData;
    });
    return keyMappedData;
  },

  get scanReturns() {
    return this._scanReturns;
  },

  addPaymentData: (suborderId, data) => {
    globalState._paymentDataBySuborderId[suborderId] = data;
  },

  getPaymentData: (suborderId) => {
    return globalState._paymentDataBySuborderId[suborderId];
  },

  findPaymentData: (suborderId) => {
    return Object.keys(globalState.paymentDataBySuborderId).includes(suborderId);
  },
};

expect.extend({
  toMatchObjectStrictly(
    received: Record<string | '_id', any>[],
    testData: Record<string, any>[],
    strictFields: string[],
    typeFields: TypeField[],
    accessKey = 'sub_order_no',
  ) {
    const errorObj = [];
    for (const currentOrder of testData) {
      // Find the order by sub_order_no to verify insertion
      const matchingOrder = received.filter((order) => order[accessKey] === currentOrder[accessKey]);
      if (!matchingOrder.length) log('Not Matching...', currentOrder);
      // Validate that exactly one matching order is found
      expect(matchingOrder).toBeDefined();

      // check length should be one
      expect(matchingOrder).toHaveLength(1);

      // Check inserted data similarity
      const { match, mismatches }: ComparisonResult = compareObjects(
        currentOrder,
        matchingOrder[0],
        strictFields,
        typeFields,
      );
      if (!match) {
        errorObj.push({
          match,
          mismatches,
          id: matchingOrder[0]._id as string,
          realData: matchingOrder[0],
          testData: currentOrder,
        });
      }
    }

    if (!errorObj.length) {
      return {
        message: () => `expected object not to match strictly`,
        pass: true,
      };
    }

    storeTestError(errorObj, 'Order_Test_case_Error');
    return {
      message: () => `expected object to match strictly, but found mismatches. Check Error File`,
      pass: false,
    };
  },
});

const userCred = {
  email: 'aum@test.com',
  password: 'aum@test.com',
};

const accountId = '54c958c8-4a2e-98c5-b64b-b6096376c6b6';

describe('APP FLOW TEST', () => {
  let loginToken = null;

  const headers: Record<string, any> = {};

  beforeAll(async () => {
    await connectTestDB();
    await ReturnOrder.deleteMany({});
    await PaymentOrders.deleteMany({});
    await Order.deleteMany({});
    const res = await request(app).post(getURL('login')).send(userCred);
    const resData = res.body.data;
    loginToken = resData.token;
    headers.Authorization = `Bearer ${loginToken}`;
  });

  afterAll(async () => {
    // await Order.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Upload Flow', () => {
    test(
      'Should upload the Order PDF and validate the inserted data',
      async () => {
        const pdfFilePath = path.join(__dirname, './TestingData/Supplier_Manifest_Aarya_2_8_24.pdf');
        const accountName = 'Aarya Fashion';
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${loginToken}`,
          },
        };

        const response = await request(app)
          .post(getURL('uploadOrder'))
          .set(config.headers)
          .field('account_name', accountName)
          .attach('order_sheet', pdfFilePath);

        log(response.body);
        expect(response.status).toBe(200);
        const responseData = response.body.data;

        expect(responseData).toHaveLength(orderTestData.length);

        const flatResData = responseData.map((d) => d.insertOne.document);
        expect(flatResData).toHaveLength(orderTestData.length);
        expect(flatResData).toMatchObjectStrictly(orderTestData, orderStrictFields, orderTypeFields as TypeField[]);

        // TODO: case to be manage
        // If uploaded duplicate orders. -- it's managed. but can write the case. but important.
      },
      1000 * 60 * 3,
    );

    test('should Upload the return sheet and validate the value and update the order db', async () => {
      const pdfFilePath = path.join(
        __dirname,
        './TestingData/Returns_Manyata fab_5d97b721-1ba8-9c8c-892c-175272716425.csv',
      );
      const accountName = 'Aarya Fashion';
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${loginToken}`,
        },
      };

      const response = await request(app)
        .post(getURL('uploadReturn'))
        .set(config.headers)
        .field('account_name', accountName)
        .attach('return_sheet', pdfFilePath);

      log(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.orderD).toBeDefined();
      expect(response.body.data.orderUpdate).toBeDefined();
      expect(response.body.data.totalReturnExtractData).toBeDefined();

      const { orderD, orderUpdate, totalReturnExtractData } = response.body.data;
      // Extracted data validation
      // validate all extracted data and length
      expect(totalReturnExtractData).toHaveLength(returnTestData.length);
      let keyMappedData = globalState.returnTestData;
      expect(totalReturnExtractData).toHaveLength(keyMappedData.length);
      expect(totalReturnExtractData).toMatchObjectStrictly(
        keyMappedData,
        returnStrictFields,
        returnTypeFields as TypeField[],
      );
      // Test the return update data. Should only return the data which we have provided as return (14 - 7 RTO - 7 CR);
      for (let returnOrder of orderD) {
        const found = find(orderTestData, (order) => order.sub_order_no === returnOrder.sub_order_no);
        expect(found).toBeDefined();

        const updatedOrder = find(orderUpdate, (order) => order.sub_order_no === returnOrder.sub_order_no);
        expect(updatedOrder).toBeDefined();

        expect(updatedOrder.awb_number).toBe(returnOrder.awb_number);
        const mapStatus = {
          'Courier Return (RTO)': 'currierReturn',
          'Customer Return': 'customerReturn',
        };
        expect(updatedOrder.order_status).toBe(mapStatus[returnOrder.type_of_return]);
      }
      // Should update the field which needed to be updated.
      // Should update the order table also. And the field which need to be updated.
    });

    test('should Upload the payment sheet and validate the value and update the order db', async () => {
      const pdfFilePath = path.join(
        __dirname,
        './TestingData/Payment_Manyata fab_fc157184-ff73-d045-3cf0-15c4afd826af.xlsx',
      );
      const accountName = 'Aarya Fashion';
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${loginToken}`,
        },
      };

      const response = await request(app)
        .post(getURL('uploadPayment'))
        .set(config.headers)
        .field('account_name', accountName)
        .attach('payment_sheet', pdfFilePath);

      log(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.orderD).toBeDefined();
      expect(response.body.data.orderUpdate).toBeDefined();

      const { orderD, orderUpdate } = response.body.data;
      // Extracted data validation
      // validate all extracted data and length
      log('flatOrderD', orderD);
      const flatOrderD = orderD.map((d) => d.insertOne.document);
      // expect(flatOrderD).toHaveLength(paymentTestData.length);
      let keyMappedData = globalState.paymentTestData;

      // expect(flatOrderD).toHaveLength(keyMappedData.length);
      expect(flatOrderD).toMatchObjectStrictly(
        keyMappedData,
        paymentStrictFields,
        paymentTypeFields as TypeField[],
        'subOrderNo',
      );
      // Test the return update data. Should only return the data which we have provided as return (14 - 7 RTO - 7 CR);
      // flatOrderD.shift()// Need to do this due to first order is not getting append > REMOVE_THIS
      for (let paymentOrder of flatOrderD) {
        const found = find(keyMappedData, (order) => order.subOrderNo === paymentOrder.subOrderNo);
        expect(found).toBeDefined();

        const updatedOrder = find(orderUpdate, (order) => order.sub_order_no === paymentOrder.subOrderNo);
        expect(updatedOrder).toBeDefined();

        expect(updatedOrder.order_price).toBe(String(paymentOrder.finalSettlementAmount));
        log('updatedOrder', updatedOrder, paymentOrder);
        // expect(updatedOrder.order_status).toBe(mapStatus[paymentOrder.liveOrderStatus]);
        globalState.addPaymentData(paymentOrder.sub_order_id, paymentOrder);
      }

      // Data convert to csv
      // store
      // create mapping for fields
      // create strict and type fields
      // convert the data fields
      // compare the fields
      // create global state
      // store the payment data by suborder id which exist in order payment in global state
      // order price and status should update
    });
  });

  test('Cancel the order', async () => {
    for (const cancelOrderId of globalState.cancelOrderList) {
      const response = await request(app).put(getURL('cancelOrder')).set(headers).send({ sub_order_id: cancelOrderId });
      log('response', response.body);
      expect(response.statusCode).toBe(200);
    }
  });

  test('Scan orders', async () => {
    for (const scanOrderId of globalState.scanReturns) {
      const awbNumber = find(globalState.returnTestData, (o) => o.sub_order_no === scanOrderId)?.awb_number;
      expect(awbNumber).toBeDefined();
      const response = await request(app)
        .put(getURL('scanOrder'))
        .set(headers)
        .send({ order_id: String(awbNumber) });
      log('scan response', response.body, awbNumber);
      expect(response.statusCode).toBe(200);
    }
  });

  describe('Issue Flow', () => {
    beforeAll(async () => {
      await createIssueOrder();
    });
    type IssueType = 'RETURN_LOST' | 'RETURN_PAYMENT_DELAYED' | 'RETURN_DELAYED' | 'NOT_DELIVERED' | 'UNKNOWN_ORDER';
    test('Test Issue orders', async () => {
      const orderState = {
        _issueOrders: {
          RETURN_DELAYED: [],
          RETURN_PAYMENT_DELAYED: [],
          NOT_DELIVERED: [],
          RETURN_LOST: [],
          UNKNOWN_ORDER: [],
        } as Record<IssueType, Partial<OrderType>[]>,
        _fulfillOrders: [],
        _cancelOrders: [],

        get fulfillOrders() {
          return this._fulfillOrders;
        },

        get issueOrder() {
          return this._issueOrders;
        },

        get cancelOrders() {
          return this._cancelOrders;
        },

        addFullFillOrder(order: Partial<OrderType>) {
          this._fulfillOrders.push(order);
        },

        addIssueOrder(order: Partial<OrderType>, group: IssueType) {
          this._issueOrders[group].push(order);
        },

        addCancelOrder(order: Partial<OrderType>) {
          this._cancelOrders.push(order);
        },
      };

      let orderData = cloneDeep(globalState.orderTestData);
      const unixOf15DaysAgo = await date15DaysAgo();
      // filter out the order which has pass the 15 days;
      orderData = filter(orderData, (o) => Number(o.order_date) <= unixOf15DaysAgo);
      // Filter out cancel
      globalState.cancelOrderList.forEach((cancelOrderId) => {
        const [removedCancelOrder] = remove(orderData, (o) => o.sub_order_no === cancelOrderId);
        orderState.addCancelOrder(removedCancelOrder);
      });
      log('TotalOrder length', globalState.orderTestData.length, 'Filter order by data length', orderData.length);

      // filter out shipped orders
      const paymentOrders = globalState.paymentTestData.filter((po) => {
        const shippedOrder = find(orderData, (o) => o.sub_order_no === po.subOrderNo);
        return !isEmpty(shippedOrder);
      });

      log(
        'TotalOrder payment length',
        globalState.paymentTestData.length,
        'Filter order by shipped order',
        paymentOrders.length,
      );

      const returnOrders = globalState.returnTestData.filter((ro) => {
        const shippedOrder = find(orderData, (o) => o.sub_order_no === ro.sub_order_no);
        return !isEmpty(shippedOrder);
      });

      log(
        'TotalOrder return length',
        globalState.returnTestData.length,
        'Filter order by shipped order',
        returnOrders.length,
      );

      // filter out delivered
      paymentOrders
        .filter((paymentOrder) => paymentOrder.liveOrderStatus === 'Delivered')
        .map((paymentOrder) => {
          const [removedPaymentSettleOrders] = remove(orderData, (o) => o.sub_order_no === paymentOrder.subOrderNo);
          orderState.addFullFillOrder(removedPaymentSettleOrders);
          return paymentOrder;
        });

      log('out of delivery order', orderState.fulfillOrders.length, 'order length', orderData.length);
      // filter out return data
      // get filtered payment data with status rto or return
      const returnFromPayment = paymentOrders
        .filter((o) => {
          const isReturn = o.liveOrderStatus === 'RTO' || o.liveOrderStatus === 'Return';
          return isReturn;
        })
        .map((o) => {
          const cloned = { ...o };
          cloned.isSettle = true;
          return cloned;
        });

      log('return From payment length', returnFromPayment.length);
      // get all return data
      const returnSheetOrders = returnOrders.map((o) => {
        const cloned = { ...o };
        cloned.isSettle = false;
        return cloned;
      });

      log('return From return length', returnSheetOrders.length);

      // merge both and give higher priority to payment return orders
      const mergedReturn: Record<
        string,
        (OrderType & { isSettle: boolean }) | (Payment & { isSettle: boolean; sub_order_no: string })
      > = {};
      returnSheetOrders.forEach((ro) => {
        // log("Is settle", ro.isSettle);
        mergedReturn[ro.sub_order_no] = ro;
      });

      returnFromPayment.forEach((rop) => {
        // log("Is settle", rop.isSettle);
        // eslint-disable-next-line no-param-reassign
        rop.sub_order_no = rop.subOrderNo;
        if (mergedReturn[rop.subOrderNo]) {
          mergedReturn[rop.subOrderNo].isSettle = true;
        } else {
          mergedReturn[rop.subOrderNo] = rop;
        }
      });

      log('merged order length', flatMap(mergedReturn).length);
      // filter out order which are scanned
      globalState.scanReturns.forEach((sroId) => {
        const scanOrder = mergedReturn[sroId];
        if (scanOrder) {
          const { isSettle } = scanOrder;
          // check if settle
          // if settle then fullfill the order
          // if not then check is how much time passed for return
          if (isSettle) {
            const [removeReturnSettleOrder] = remove(orderData, (o) => o.sub_order_no === sroId);
            orderState.addFullFillOrder(removeReturnSettleOrder);
            delete mergedReturn[sroId];
            return;
          }

          const [paymentDelayOrder] = remove(orderData, (o) => o.sub_order_no === sroId);
          orderState.addIssueOrder(paymentDelayOrder, 'RETURN_PAYMENT_DELAYED');
          delete mergedReturn[sroId];
        }
      });

      log('After scan filter order length', orderData.length);
      Object.values(mergedReturn).forEach((ro) => {
        log('Is settle', ro.isSettle);
        if (ro.isSettle) {
          const [removeReturnLost] = remove(orderData, (o) => o.sub_order_no === ro.sub_order_no);
          orderState.addIssueOrder(removeReturnLost, 'RETURN_LOST');
          delete mergedReturn[ro.sub_order_no];
        } else {
          const [removeReturnLost] = remove(orderData, (o) => o.sub_order_no === ro.sub_order_no);
          orderState.addIssueOrder(removeReturnLost, 'RETURN_DELAYED');
          delete mergedReturn[ro.sub_order_no];
        }
      });
      log('After return lost and return delayed', orderData.length);

      orderData.forEach((io) => {
        orderState.addIssueOrder(io, 'NOT_DELIVERED');
        // remove(orderData, (o) => o.sub_order_no === io.sub_order_no);
      });
      orderData = [];

      log('After not delivered', orderData.length);

      const config = {
        headers: {
          Authorization: `Bearer ${loginToken}`,
        },
      };

      const response = await request(app).get(getURL('getIssueOrder')).set(config.headers).query({
        account_id: accountId,
        limit: 200,
        offset: 0,
        is_order_issue: true,
      });

      log(response.body);
      storeTestError(
        {
          responseIssueOrder: response.body,
          issueOrder: {
            issue: orderState.issueOrder,
            issueCount: flatMap(orderState.issueOrder).length,
            counts: {
              NOT_DELIVERED: orderState.issueOrder.NOT_DELIVERED.length,
              RETURN_DELAYED: orderState.issueOrder.RETURN_DELAYED.length,
              RETURN_PAYMENT_DELAYED: orderState.issueOrder.RETURN_PAYMENT_DELAYED.length,
              RETURN_LOST: orderState.issueOrder.RETURN_LOST.length,
              UNKNOWN_ORDER: orderState.issueOrder.UNKNOWN_ORDER.length,
            } as Record<IssueType, number>,
          },
          cancelOrders: orderState.cancelOrders,
          cancelOrderCount: orderState.cancelOrders.length,
          fulfillOrder: orderState.fulfillOrders,
          fulfillOrderCount: orderState.fulfillOrders.length,
          totalOrder: globalState.orderTestData.length,
        },
        'Issue_orders_',
      );
      expect(response.status).toBe(200);
    });
  });
});
