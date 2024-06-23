import { Router } from 'express';
import multer from 'multer';
import { authentication } from '../../middleware/authenticate-user';
import { returnOrder, uploadOrderSheetHandler } from './post.order';

import { returnOrderHandler } from './get.sheetOrder';
import { updateReturnOrderHandler } from './put.sheeOrder';

const sheetOrder = Router();
sheetOrder.use(authentication);
const storage = multer.memoryStorage();
const upload = multer({ storage, dest: '/uploads' });
sheetOrder.post('/upload', upload.single('order_sheet'), uploadOrderSheetHandler);
sheetOrder.post('/return', upload.single('return_sheet'), returnOrder);
// sheetOrder.get('/', getSheetOrderHandler);
sheetOrder.get('/return', returnOrderHandler);
sheetOrder.put('/update', updateReturnOrderHandler);
export default sheetOrder;
