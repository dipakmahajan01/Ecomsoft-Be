import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as dotenv from 'dotenv';
import { USER, ERROR } from '../common/global-constants';
import { extractJwtToken, responseGenerators } from '../lib';
import Session from '../model/session.model';
import { verifyJwt } from '../helpers/jwt.helper';

dotenv.config();
export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = extractJwtToken(req.headers.authorization);
    if (!authorization) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.TOKEN, true));
    }
    const sessionData = await Session.findOne({ access_token: authorization, is_expired: false });
    if (!sessionData) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(responseGenerators({}, StatusCodes.UNAUTHORIZED, USER.SESSION_EXPIRED, true));
    }
    // verify token with jwt method
    const tokenData = await verifyJwt(authorization);
    if (!tokenData) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(responseGenerators({}, StatusCodes.UNAUTHORIZED, USER.NOT_AUTHORIZED, true));
    }
    req.headers.tokenData = tokenData as any;
    return next();
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.ERROR_MESSAGE));
  }
};
