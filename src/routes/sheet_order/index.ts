import { Router } from 'express';
import multer from 'multer';
import { authentication } from '../../middleware/authenticate-user';
import { paymentOrderUpload, uploadOrderSheetHandler } from './post.order';

import { getAnalyticsHandler, getSellerAnalyticsHandler, returnOrderHandler } from './get.sheetOrder';
import { updateReturnOrderHandler } from './put.sheeOrder';

const sheetOrder = Router();
sheetOrder.use(authentication);
const storage = multer.memoryStorage();
const upload = multer({ storage, dest: '/uploads' });
sheetOrder.post('/upload', upload.single('order_sheet'), uploadOrderSheetHandler);
sheetOrder.post('/payment-sheet/upload', upload.single('payment_sheet'), paymentOrderUpload);
// sheetOrder.get('/', getSheetOrderHandler);
sheetOrder.get('/return', returnOrderHandler);
sheetOrder.get('/order-report', getAnalyticsHandler);
sheetOrder.get('/order-analytics', getSellerAnalyticsHandler);
sheetOrder.put('/update', updateReturnOrderHandler);
export default sheetOrder;
