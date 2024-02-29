import dotenv from 'dotenv';
import { sign, verify } from 'jsonwebtoken';
import { ITokenData } from '../common/global-constants';

dotenv.config();

const jwtOption = {
  expiresIn: process.env.EXPIRED_IN || '1d',
};
const refreshJwtOption = {
  expiresIn: process.env.REFRESH_EXPIRED_IN || '1y',
};
export const createJwtToken = (data: ITokenData) => {
  return sign(data, process.env.SECRET_KEY, jwtOption);
};
export function getJwt(data: ITokenData) {
  return sign(data, process.env.SECRET_KEY, jwtOption);
}
export function getRefreshJwt(data: ITokenData) {
  return sign(data, process.env.SECRET_KEY, refreshJwtOption);
}
export function getOTPJwt(data: ITokenData) {
  return sign(data, process.env.SECRET_KEY, jwtOption);
}

export async function verifyJwt(authorization: string): Promise<ITokenData> {
  const token = await verify(authorization, process.env.SECRET_KEY);
  return token as ITokenData;
}
