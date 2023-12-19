import { Router } from 'express';
import { addMarketPlaceCred } from './post.credential';
import { getMarketplaceCred } from './get.credentials';
import { authentication } from '../../middleware/authenticate-user';

const marketPlaceRoutes = Router();

marketPlaceRoutes.use(authentication);
marketPlaceRoutes.post('/add', addMarketPlaceCred);
marketPlaceRoutes.get('/', getMarketplaceCred);

export default marketPlaceRoutes;
