import { StatusCodes } from 'http-status-codes';
import { responseGenerators } from '../../lib';
import { Request, Response } from 'express';
import { ERROR, RATE_CARD } from '../../common/global-constants';
import {
  extractCollectionFees,
  extractCommissionFees,
  extractFixedFees,
  extractReverseShippingFees,
  extractShippingFees,
} from './helper.rateCard';
import RateCard from '../../model/rateCard.model';

export const createRateCardData = async (req: Request, res: Response) => {
  try {
    const { fsnCode, rateCard } = req.body;
    const commission = extractCommissionFees(rateCard.platformFee);
    const collectionFess = extractCollectionFees(rateCard.collectionFee);
    const fixedFess = extractFixedFees(rateCard.closingFee);
    const shippingFees = extractShippingFees(rateCard.shippingFee);
    const reverseShippingFees = extractReverseShippingFees(rateCard.reverseShippingFee);
    const rateCardFinalData = {
      fsn_code: fsnCode,
      commission,
      fixed_fees: fixedFess,
      collection_fees: collectionFess,
      shipping_fee: shippingFees,
      reverse_shipping_fee: reverseShippingFees,
    };
    const rateCardData = await RateCard.findOneAndUpdate({ fsn_code: fsnCode }, rateCardFinalData, { upsert: true });
    return res.status(StatusCodes.OK).send(responseGenerators(rateCardData, StatusCodes.OK, RATE_CARD.SUCCESS, false));
  } catch (error) {
    console.log(error)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
