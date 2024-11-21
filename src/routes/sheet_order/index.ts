import { Router } from 'express';
import multer from 'multer';
import { authentication } from '../../middleware/authenticate-user';
import { paymentOrderUpload, returnOrder, uploadOrderSheetHandler } from './post.order';

import { getOrderCountHandler, getSellerAnalyticsHandler, returnOrderHandler } from './get.sheetOrder';
import { cancelledOrderHandler, updateReturnOrderHandler } from './put.sheeOrder';

const sheetOrder = Router();
sheetOrder.use(authentication);
const storage = multer.memoryStorage();
const upload = multer({ storage, dest: '/uploads' });
sheetOrder.post('/upload', upload.single('order_sheet'), uploadOrderSheetHandler);
sheetOrder.post('/payment-sheet/upload', upload.single('payment_sheet'), paymentOrderUpload);
// sheetOrder.get('/', getSheetOrderHandler);
sheetOrder.get('/return', returnOrderHandler);
sheetOrder.get('/order-report', getOrderCountHandler);
sheetOrder.get('/order-analytics', getSellerAnalyticsHandler);
sheetOrder.post('/return', upload.single('return_sheet'), returnOrder);
sheetOrder.put('/update', updateReturnOrderHandler);
sheetOrder.put('/cancelled-order', cancelledOrderHandler);
export default sheetOrder;
