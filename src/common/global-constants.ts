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
  TOKEN: 'please added  token',
  SESSION_EXPIRED: 'user session expired',
  NOT_AUTHORIZED: 'your not authorized user',
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
export const FLIPKART = {
  GENERATE_TOKEN_API:
    'https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials&scope=Seller_Api',
  ORDER_API: 'https://api.flipkart.net/sellers/v3/shipments/filter/',
  FLIPKART_BASE_URL: 'https://api.flipkart.net',
  ORDER_STATUS_API: 'https://api.flipkart.net/sellers/v2/returns',
};
