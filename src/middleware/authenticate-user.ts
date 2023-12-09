import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { responseGenerators } from '../lib';
import Session from '../model/session.model';
import { verifyJwt } from '../helpers/jwt.helper';
import * as dotenv from 'dotenv';
dotenv.config();
export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST));
    }
    const sessionData = await Session.findOne({ access_token: authorization, is_expired: false });
    if (!sessionData) {
      return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED));
    }
    //verify token with jwt method
    const tokenData = await verifyJwt(authorization);
    if (!tokenData) {
      return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED));
    }
    req.headers.tokenData = tokenData as any;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED));
  }
};
