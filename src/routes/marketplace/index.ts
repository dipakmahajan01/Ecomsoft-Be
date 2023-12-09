import { Router } from 'express';
import { addMarketPlaceCred } from './post.credential';
import { getMarketplaceCred } from './get.credentials';

const marketPlaceRoutes = Router();

marketPlaceRoutes.post('/add', addMarketPlaceCred);
marketPlaceRoutes.get('/get', getMarketplaceCred);

export default marketPlaceRoutes;
