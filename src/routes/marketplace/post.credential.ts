import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import axios from 'axios';
import { responseGenerators } from '../../lib';
import { generatePublicId, getUserData, setTimesTamp } from '../../common/common-function';
import { CREDENTIALS, ERROR, FLIPKART } from '../../common/global-constants';
import UserCredential from '../../model/user_credential.model';
import { addMarketPlaceSchemaHandler } from '../../helpers/validation/marketpalce.validation';

export const addMarketPlaceCred = async (req: Request, res: Response) => {
  try {
    const { user_id: userId } = getUserData(req);
    await addMarketPlaceSchemaHandler.validateAsync(req.body);
    const { market_place_name: marketPlaceName, account_name: accountName, badge, code } = req.body;
    // already exists UserCredential
    const foundCredentials = await UserCredential.findOne({ account_name: accountName, is_deleted: false });
    if (foundCredentials) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, CREDENTIALS.AlREADY));
    }
    const auth: any = {
      username: process.env.APP_ID,
      password: process.env.APP_SECRET,
    };
    const { data } = await axios.get(`${FLIPKART.GENERATE_TOKEN_API}${code}`, { auth });
    if (!data) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, ERROR.FLIPKART_TOKEN, true));
    }
    // create new user
    const expiredAt = data.expires_in.toString();
    const platformId = generatePublicId();
    await UserCredential.create({
      platform_id: platformId,
      market_place_name: marketPlaceName,
      account_name: accountName,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expired_at: expiredAt,
      badge,
      security_code: code,
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
