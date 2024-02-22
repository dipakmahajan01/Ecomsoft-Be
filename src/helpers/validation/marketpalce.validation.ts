import Joi from 'joi';

export const addMarketPlaceSchemaHandler = Joi.object({
  market_place_name: Joi.string().optional(),
  account_name: Joi.string().required(),
  badge: Joi.string().optional(),
  code: Joi.string().required(),
});
