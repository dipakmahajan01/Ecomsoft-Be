import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logsError, responseGenerators } from '../../lib';
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
    const { rateCard } = req.body;
    const rateCardArray = Array.isArray(rateCard) ? rateCard : [rateCard];

    for (let card of rateCardArray) {
      const commission = extractCommissionFees(card.platformFee);
      const collectionFess = extractCollectionFees(card.collectionFee);
      const fixedFess = extractFixedFees(card.closingFee);
      const shippingFees = extractShippingFees(card.shippingFee);
      const reverseShippingFees = extractReverseShippingFees(card.reverseShippingFee);
      const rateCardFinalData = {
        fsn_code: card.fsnCode,
        commission,
        fixed_fees: fixedFess,
        collection_fees: collectionFess,
        shipping_fee: shippingFees,
        reverse_shipping_fee: reverseShippingFees,
        needs_to_add: false,
      };
      await RateCard.findOneAndUpdate({ fsn_code: card.fnsCode }, rateCardFinalData, { upsert: true });
    }
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, RATE_CARD.SUCCESS, false));
  } catch (error: any) {
    logsError(error.message, error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
