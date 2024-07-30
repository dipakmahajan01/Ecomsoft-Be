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
  OLD_PASSWORD_NOT_MATCH: 'Old password does not match please try again',
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
  FLIPKART_TOKEN: 'flipkart token is not created',
};
export const FLIPKART = {
  GENERATE_TOKEN_API: `https://api.flipkart.net/oauth-service/oauth/token?redirect_uri=https%3A%2F%2Faumsoft.vercel.app%2F&grant_type=authorization_code&state=fb-seller&code=`,
  ORDER_API: 'https://api.flipkart.net/sellers/v3/shipments/filter/',
  RETURN_ORDER_API: 'https://api.flipkart.net/sellers/v2/returns',
  FLIPKART_BASE_URL: 'https://api.flipkart.net',
  ORDER_STATUS_API: 'https://api.flipkart.net/sellers/v2/returns',
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

export const FLIPKART_ORDER_STATUS = {
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
};

export const STATUS = {
  CANCELLED: 'CANCELLED',
  ON_GOING: 'ON_GOING',
  COMPLETED: 'COMPLETED',
  COURIER_RETURN: 'COURIER_RETURN',
  CUSTOMER_RETURN: 'CUSTOMER_RETURN',
  DELIVERED: 'DELIVERED',
  // REPLACEMENT: "REPLACEMENT" // may be base on how we are going to handle it.
};

export const FLIPKART_PAYMENT_TYPES = {
  PREPAID: 'PREPAID',
  COD: 'COD',
  POSTPAID: 'POSTPAID',
};

export const CHECK_STATUS_OF_DAYS = 8;
export const RETURN_DEADLINE_IN_DAYS = 10;

// Config for net profit calculation

export const ORDER_NET_PROFIT = {
  COMPLETED: ['commission', 'shippingFee', 'fixedFee', 'collectionFee'],
  REFUND: ['commission', 'shippingFee', 'fixedFee', 'collectionFee', 'reverseShippingFee'],
  REPLACEMENT: ['commission', 'shippingFee', 'fixedFee', 'collectionFee', 'reverseShippingFee', 'shippingFee'],
};

export const ORDER = {
  NOT_FOUND: 'order not found',
  FOUND: 'order found successfully',
  CREATED: 'order successfully inserted',
  UPDATE: 'order update successfully',
  NOT_UPDATE: 'Return order not updated',
  RETURN_NOT_FOUND: 'Return order not found',
  FOUND_ORDER_REPORT: 'found order report',
  ORDER_AlREADY_SCAN: 'already order scan',
};
