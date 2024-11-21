import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import User from '../../model/user.model';
import { comparePassword, getUserData, hashPassword } from '../../common/common-function';
import { ERROR, USER } from '../../common/global-constants';
import { responseGenerators } from '../../lib';

export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const { old_password: oldPassword, new_password: newPassword } = req.body;
    const { user_id: userId } = getUserData(req);
    const userData = await User.findOne({ user_id: userId, is_deleted: false });
    if (!userData) {
      return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.NOT_FOUND));
    }
    const isMatch = await comparePassword(oldPassword, userData.password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.OLD_PASSWORD_NOT_MATCH));
    }
    const bcryptPassword = await hashPassword(newPassword);
    await User.updateOne({ user_id: userId, is_deleted: false }, { password: bcryptPassword });
    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USER.PASSWORD_UPDATE));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
};
