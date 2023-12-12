import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { ValidationError } from 'joi';
import { responseGenerators } from '../../lib';
import User from '../../model/user.model';
import { generatePublicId, hashPassword, setTimesTamp } from '../../common/common-function';
import { ERROR, USER } from '../../common/global-constants';
import { userValidationSchema } from '../../helpers/validations';

export const createSellerHandler = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = await userValidationSchema.validateAsync(req.body);
    // already exists user
    const userData = await User.findOne({ email, is_deleted: false });
    if (userData) {
      return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.AlREADY));
    }
    let bcryptPassword = await hashPassword(password);
    // create new user`
    const userId = generatePublicId();
    await User.create({
      user_id: userId,
      user_name: username,
      email,
      password: bcryptPassword,
      created_at: setTimesTamp(),
      created_by: userId,
    });
    return res.status(StatusCodes.OK).json(responseGenerators({}, StatusCodes.OK, USER.CREATED, false));
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, true));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, error.message || ERROR.INTERNAL_SERVER_ERROR, true),
      );
  }
};
