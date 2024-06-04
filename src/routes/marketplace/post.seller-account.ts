import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { responseGenerators } from '../../lib';
import { generatePublicId, getUserData, setTimesTamp } from '../../common/common-function';
import { CREDENTIALS, ERROR } from '../../common/global-constants';
import { addMarketPlaceSchemaHandler } from '../../helpers/validation/marketpalce.validation';
import sellerAccounts from '../../model/seller_accounts.model';

export const addMarketPlaceCred = async (req: Request, res: Response) => {
  try {
    const { user_id: userId } = getUserData(req);
    await addMarketPlaceSchemaHandler.validateAsync(req.body);
    const { market_place_name: marketPlaceName, account_name: accountName } = req.body;
    // already exists UserCredential
    const foundCredentials = await sellerAccounts.findOne({ account_name: accountName, is_deleted: false });
    if (foundCredentials) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, CREDENTIALS.AlREADY));
    }
    // create new user
    const platformId = generatePublicId();
    await sellerAccounts.create({
      platform_id: platformId,
      market_place_name: marketPlaceName,
      account_name: accountName,
      user_id: userId,
      created_by: userId,
      created_at: setTimesTamp(),
    });
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, CREDENTIALS.SUCCESS, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
