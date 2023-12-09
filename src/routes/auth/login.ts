

import { Request, Response } from "express";
import { createJwtToken } from "../../helpers/jwt.helper";
import { responseGenerators } from "../../lib";
import User from "../../model/user.model";
import Session from "../../model/session.model";
import { StatusCodes } from "http-status-codes";
import { ERROR, USER } from "../../common/global-constants";
import { comparePassword } from "../../common/common-function";

export const loginHandler = async(req:Request, res:Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, is_deleted: false });
    if (!user) {
      return  res.status(StatusCodes.NOT_FOUND).send(responseGenerators({},StatusCodes.NOT_FOUND,USER.NOT_FOUND, true))
    }
    // login password match
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({},StatusCodes.BAD_REQUEST,USER.PASSWORD, false))
    }
 
    // created jwt token
    const jwtToken = createJwtToken({
      user_id: user?.user_id,
      email: user?.email,
      created_by: user?.user_id,
    });
    await Session.findOneAndUpdate(
      { user_id: user.user_id },
      {
        $set: {
          user_id: user.user_id,
          access_token: jwtToken,
          created_by: user.user_id,
          is_expired: false,
          // created_at: setTimesTamp(),
        },
      },
    );

    const userData = {
      user_id: user.user_id,
      email: user.email,
      token:jwtToken
    };
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators(userData,StatusCodes.BAD_REQUEST,USER.SUCCESS, false))
  }
   catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(responseGenerators({},StatusCodes.INTERNAL_SERVER_ERROR,ERROR.INTERNAL_SERVER_ERROR, false))
  }
}