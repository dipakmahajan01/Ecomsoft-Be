import { Router } from 'express';
import { createRateCardData } from './post.ratecard';
import { getRateCardIds } from './get.rateCardIds';

const rateCardRoutes = Router();

rateCardRoutes.post('/add', createRateCardData);
rateCardRoutes.get('/ids', getRateCardIds);

export default rateCardRoutes;
