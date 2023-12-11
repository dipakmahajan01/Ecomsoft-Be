import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { responseGenerators } from '../../lib';
import { ERROR, USER } from '../../common/global-constants';
import { getUserData } from '../../common/common-function';
import User from '../../model/user.model';

export const getSingleSellerHandler = async (req: Request, res: Response) => {
  try {
    const { user_id: userId } = getUserData(req);
    const userData = await User.findOne({ user_id: userId, is_deleted: false });
    if (userData) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));
    }
    return res.status(StatusCodes.OK).send(responseGenerators(userData, StatusCodes.OK, USER.FOUND, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
