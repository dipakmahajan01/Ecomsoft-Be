import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { responseGenerators } from '../../lib';
import { getUserData } from '../../common/common-function';
import { CREDENTIALS, ERROR } from '../../common/global-constants';
import UserCredential from '../../model/user_credential.model';

export const getMarketplaceCred = async (req: Request, res: Response) => {
  try {
    const { user_id: userId } = getUserData(req);
    const credentialDetails = await UserCredential.find({ user_id: userId, is_deleted: false });
    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(credentialDetails ?? [], StatusCodes.OK, CREDENTIALS.SUCCESS, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
