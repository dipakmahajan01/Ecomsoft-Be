import * as Joi from 'joi';

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const signup = login.keys({
  username: Joi.string().min(2).required(),
});

export const userValidationSchema = {
  login,
  signup,
};

export const getOrderHandlerSchema = Joi.object({
  sku_id: Joi.string().optional(),
  limit: Joi.string().optional(),
  status: Joi.string().optional(),
  is_analytics: Joi.boolean().optional(),
  flipkart_status: Joi.string().optional(),
  start_date: Joi.string().optional(),
  end_date: Joi.string().optional(),
});
