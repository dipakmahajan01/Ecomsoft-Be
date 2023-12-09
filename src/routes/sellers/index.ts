import { Router } from 'express';
import { changePasswordHandler } from './put.seller';
import { createSellerHandler } from './post.seller';
import { authentication } from '../../middleware/authenticate-user';

const sellerRoute = Router()

sellerRoute.post('/',createSellerHandler)
sellerRoute.use(authentication)
sellerRoute.put('/change-password',changePasswordHandler)
export default sellerRoute