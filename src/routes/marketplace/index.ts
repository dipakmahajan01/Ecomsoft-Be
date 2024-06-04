import { Router } from 'express';
import { addMarketPlaceCred } from './post.seller-account';
import { getMarketplaceCred } from './get.seller-accounts';
import { authentication } from '../../middleware/authenticate-user';

const marketPlaceRoutes = Router();

marketPlaceRoutes.use(authentication);
marketPlaceRoutes.post('/add', addMarketPlaceCred);
marketPlaceRoutes.get('/', getMarketplaceCred);

export default marketPlaceRoutes;
