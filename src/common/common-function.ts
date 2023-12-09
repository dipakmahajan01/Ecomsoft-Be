import { uuid } from 'uuidv4';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { ITokenData } from './global-constants';

const salt = bcrypt.genSaltSync(10);
export const generatePublicId = (): string => {
  return uuid();
};

export const setTimesTamp = () => {
  return dayjs().unix();
};
export const hashPassword = async (password: any) => {
  return bcrypt.hashSync(password, salt);
};
export const comparePassword = async (password: any, hash: any) => {
  return bcrypt.compareSync(password, hash);
};

export const getUserData = (req: Request) => req.headers.tokenData as any;
