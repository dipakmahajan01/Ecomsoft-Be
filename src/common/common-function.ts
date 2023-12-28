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

export function getStartOfDay(date = new Date()) {
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getEndOfDay(date = new Date()) {
  date.setHours(23, 59, 59, 999);
  return date;
}

export function getDateBeforeDays(beforeDays: number) {
  const thatDay = new Date();
  thatDay.setDate(thatDay.getDate() - beforeDays);
  thatDay.setHours(0, 0, 0, 0);
  return thatDay;
}
export const convertIntoUnix = (date) => {
  const specificDate = dayjs(date);

  // Convert it to Unix timestamp in seconds
  const unixTimestamp = specificDate.unix();
  return unixTimestamp;
};
