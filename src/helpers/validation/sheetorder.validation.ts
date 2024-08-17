import Joi from 'joi';

export const returnOrderSchema = Joi.object({
  account_id: Joi.string().allow('').optional(),
  is_return_update: Joi.string().allow('').optional(),
  status: Joi.string().allow('').optional(),
  is_order_issue: Joi.string().allow('').optional(),
  limit: Joi.number().optional(),
  offset: Joi.number().required(),
});

export const getAnalyticsSchema = Joi.object({
  account_id: Joi.string().required(),
});

export const updateReturnOrderSchema = Joi.object({
  order_id: Joi.string().required(),
});
export const cancelledOrderSchema = Joi.object({
  sub_order_id: Joi.string().required(),
});
