import { Router } from 'express';
import multer from 'multer';
import { uploadOrderSheetHandler } from './order';
import { authentication } from '../../middleware/authenticate-user';

const sheetOrder = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, dest: '/uploads' });
sheetOrder.post('/upload', authentication, upload.single('order_sheet'), uploadOrderSheetHandler);

export default sheetOrder;
