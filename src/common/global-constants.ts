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
export const FLIPKART = {
  GENERATE_TOKEN_API:
    'https://api.flipkart.net/oauth-service/oauth/token?grant_type=client_credentials&scope=Seller_Api',
  ORDER_API: 'https://api.flipkart.net/sellers/v3/shipments/filter/',
  RETURN_ORDER_API: 'https://api.flipkart.net/sellers/v2/returns',
  FLIPKART_BASE_URL: 'https://api.flipkart.net',
  GET_SHIPMENT_V2: 'https://api.flipkart.net/sellers/v2/orders/shipments',
  GET_SHIPMENT_V3: 'https://api.flipkart.net/sellers/v3/shipments',
};

export const FLIPKART_STATUS = {
  SELLER_CANCELLATION: 'seller_cancellation',
};

export const FLIPKART_SERVICE_PROFILE = {
  NON_FBF: 'NON_FBF',
  FBF: 'FBF',
  SELLER_FULFILMENT: 'Seller_Fulfilment', // This is same as NON_FBF
  // FLIPKART_FULFILMENT: 'Seller_Fulfilment', //We don't know now what will be the value for this, This is same as FBF
};

export const STATUS = {
  CANCELLED: 'CANCELLED',
  ON_GOING: 'ON_GOING',
  COMPLETED: 'COMPLETED',
  COURIER_RETURN: 'COURIER_RETURN',
  CUSTOMER_RETURN: 'CUSTOMER_RETURN',
  // REPLACEMENT: "REPLACEMENT" // may be base on how we are going to handle it.
};
