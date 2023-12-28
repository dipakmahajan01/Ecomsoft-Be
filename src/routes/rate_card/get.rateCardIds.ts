import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { responseGenerators } from '../../lib';
import RateCard from '../../model/rateCard.model';

export const getRateCardIds = async (req: Request, res: Response) => {
  try {
    const rateCardIds = await RateCard.find({}).select('fsn_code').limit(3000);
    if (!rateCardIds) {
      return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, 'No found', true));
    }

    const ids = rateCardIds.map((item: any) => item.fsn_code);
    const uniqueIds = new Set(ids);
    return res.status(StatusCodes.OK).send(responseGenerators([...uniqueIds], StatusCodes.OK, 'DONE', false));
  } catch (error: any) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, error.message ?? 'Something went wrong!', true));
  }
};
