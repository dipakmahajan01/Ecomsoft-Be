import { Router } from 'express';
import multer from 'multer';
import { authentication } from '../../middleware/authenticate-user';
import { uploadOrderSheetHandler } from './order';

import { getSheetOrderHandler } from './get.sheetOrder';

const sheetOrder = Router();
sheetOrder.use(authentication);
const storage = multer.memoryStorage();
const upload = multer({ storage, dest: '/uploads' });
sheetOrder.post('/upload', upload.single('order_sheet'), uploadOrderSheetHandler);
sheetOrder.get('/', getSheetOrderHandler);
export default sheetOrder;
