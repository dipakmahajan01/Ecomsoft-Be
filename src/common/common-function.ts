import XLSX from 'xlsx';
import uuid from 'react-uuid';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import utc from 'dayjs/plugin/utc';
import pdf from 'pdf-parse';

import { ITokenData } from './global-constants';

dayjs.extend(utc);
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
export const convertUnixToDate = (date) => {
  return dayjs.unix(date).format('YYYY-MM-DD HH:mm:ss');
};
export const convertDateToUnix = (date: Date | null) => {
  if (date) {
    const formattedDate = dayjs(date).format('ddd MMM DD YYYY 00:00:00 [GMT+0530]');
    const unixTimestamp = dayjs(formattedDate).unix();
    return unixTimestamp;
  }
  return null;
};

export const allZeroConvertIntoUnix = (date) => {
  return dayjs(date).startOf('day').unix();
};
export const differenceBetweenTwoDate = (oldDate, todayDate) => {
  const date1 = dayjs.unix(oldDate);
  const date2 = dayjs.unix(todayDate);
  const daysDifference = date2.diff(date1, 'day');
  // console.log('daysDifference', daysDifference);
  return daysDifference;
};
export const setPagination = async (options) => {
  const sort: any = {};
  if (options.sort_column) {
    const sortColumn = options.sort_column;
    const order = options?.sort_order === 'asc' ? 1 : -1;
    sort[sortColumn] = order;
  } else {
    sort.created_at = -1;
  }

  const limit = +options.limit ? +options.limit : null;
  const offset = ((+options.offset ? +options.offset : 1) - 1) * (+limit ? +limit : 10);
  return { sort, offset, limit };
};

// eslint-disable-next-line consistent-return
export async function convertPdfToExcel(pdfPath) {
  try {
    // Read the PDF file
    // const dataBuffer = fs.readFileSync(pdfPath.buffer);

    // Extract text and data from the PDF
    const pdfData = await pdf(pdfPath.buffer);

    // Split the text into lines
    const lines = pdfData.text.split('\n');

    // Create a new workbook and worksheet
    // const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Populate the worksheet with data from the PDF
    lines.forEach((line) => {
      const row = line.split(/\s+/); // Split line into columns based on spaces
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 }); // Append row
    });
    const sheet = XLSX.utils.sheet_to_json(worksheet);
    return sheet;
  } catch (error) {
    return error;
  }
}
