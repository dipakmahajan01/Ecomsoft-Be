import { Router } from 'express';
import { createRateCardData } from './post.ratecard';

const rateCardRoutes = Router();

rateCardRoutes.post('/add', createRateCardData);

export default rateCardRoutes;
