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

export const getUserData = (req: Request) => (req.headers as any).tokenData as ITokenData;

export function getTomorrow(): Date {
  const tomorrow: Date = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow;
}

export function getToday(): Date {
  return new Date();
}

export function formatDateToYYYYMMDD(inputDate: Date): string {
  const year: number = inputDate.getFullYear();
  const month: string = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day: string = String(inputDate.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
