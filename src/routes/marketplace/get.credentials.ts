import { StatusCodes } from 'http-status-codes';
import { responseGenerators } from '../../lib';
import { getUserData } from '../../common/common-function';
import { Request, Response } from 'express';
import { CREDENTIALS, ERROR, USER } from '../../common/global-constants';
import UserCredential from '../../model/user_credential.model';

export const getMarketplaceCred = async (req: Request, res: Response) => {
  try {
    const { userId } = getUserData(req);
    const credentialDetails = await UserCredential.findOne({ user_id: userId, is_deleted: false });
    if (credentialDetails) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, CREDENTIALS.NOT_FOUND));
    }
    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(credentialDetails, StatusCodes.OK, CREDENTIALS.SUCCESS, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
