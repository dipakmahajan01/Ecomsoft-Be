export interface ITokenData {
  email: string;
  user_id: string;
  created_by: string;
}
export const USER = {
  AlREADY: 'user already created',
  CREATED: 'user created successfully',
  NOT_FOUND: 'user not found',
  FOUND: 'user successfully found',
  PASSWORD: 'password does not match please try again',
  SUCCESS: 'user successfully',
  PASSWORD_UPDATE: 'password successfully updated',
  LOGOUT_FAIL: 'user logout failed',
  LOGOUT_SUCCESS: 'user logout failed',
};

export const CREDENTIALS = {
  AlREADY: 'Credentials already exists',
  CREATED: 'Credentials created successfully',
  NOT_FOUND: 'Credentials not found',
  SUCCESS: 'Credentials successfully',
};

export const RATE_CARD = {
  AlREADY: 'Rate card already exists',
  CREATED: 'Rate card created successfully',
  NOT_FOUND: 'Rate card not found',
  SUCCESS: 'Rate card successfully',
};

export const ERROR = {
  INTERNAL_SERVER_ERROR: 'something went wrong',
  ERROR_MESSAGE: 'user token expired',
};
