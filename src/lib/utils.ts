import * as dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

export function responseGenerators(
  responseData?: object,
  responseStatusCode?: number,
  responseStatusMsg?: string,
  responseErrors?: boolean,
  token?: string,
  refreshToken?: string,
) {
  const responseJson: any = {};
  responseJson.data = responseData;
  responseJson.status_code = responseStatusCode;
  responseJson.status_message = responseStatusMsg;
  // errors
  if (responseErrors === undefined) {
    responseJson.response_error = [];
  } else {
    responseJson.response_error = responseErrors;
  }
  // token
  if (token !== undefined && refreshToken !== undefined) {
    responseJson.token = token;
    responseJson.refreshToken = refreshToken;
  }
  return responseJson;
}

export const logDateFormat = () => {
  return 'DD-MM-YYYY';
};

export const DateFormat = () => {
  // return only date ex:2021-11-25 00:00:00
  return 'YYYY-MM-DD 00:00:00';
};

export function weekNumberFormat() {
  // return only digit ex:0-6 sunday as 0
  return 'd';
}

export function yearlyFormat() {
  // return only DD-MM
  return 'DD-MM';
}

export function dateFormat() {
  return 'YYYY-MM-DD HH:mm:ss';
}

export function timeFormat() {
  return 'HH:mm:00';
}

export function dayFormat() {
  return 'dddd';
}

export function DDMMYYYYFormat() {
  return 'DD-MM-YYYY';
}

export function responseValidation(responseStatusCode?: number, responseStatusMsg?: string, responseErrors?: boolean) {
  const responseValidationJson: any = {};
  responseValidationJson.status_code = responseStatusCode;
  responseValidationJson.status_message = responseStatusMsg;
  // errors
  if (responseErrors === undefined) {
    responseValidationJson.response_error = [];
  } else {
    responseValidationJson.response_error = responseErrors;
  }
  return responseValidationJson;
}

export const generateOTP = function (otpLength = 6) {
  const baseNumber = 10 ** (otpLength - 1);
  let number = Math.floor(Math.random() * baseNumber);
  if (number < baseNumber) {
    number += baseNumber;
  }
  return number;
};

export const otpAge = parseInt(process.env.OTP_AGE as any, 10) || 3;

export const logsErrorAndUrl = (req: { url: any }, error: any) => {
  const errorMessage = typeof error === 'object' ? error.message : error;
  const errorStack = typeof error === 'object' ? error.stack : null;
  logger.error(`${errorMessage}, time: ${new Date().toISOString()}, path: ${req.url}`, errorStack);
};

export const logsError = (error: any) => {
  const errorMessage = typeof error === 'object' ? error.message : error;
  const errorStack = typeof error === 'object' ? error.stack : null;
  logger.error(`${errorMessage}, time: ${new Date().toISOString()}`, errorStack);
};
