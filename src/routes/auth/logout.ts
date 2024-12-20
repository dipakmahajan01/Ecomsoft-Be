import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Session from '../../model/session.model';
import { responseGenerators } from '../../lib';
import { ITokenData, USER } from '../../common/global-constants';

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const tokenUserData: any = (req.headers as any).tokenData as ITokenData;

    const sessionData = await Session.findOneAndUpdate(
      {
        user_id: tokenUserData.user_id,
        is_deleted: false,
      },
      { $set: { is_expired: true } },
    );
    if (!sessionData) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.LOGOUT_FAIL, true));
    }
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USER.LOGOUT_SUCCESS, false));
  } catch (error) {
    return error;
  }
};
