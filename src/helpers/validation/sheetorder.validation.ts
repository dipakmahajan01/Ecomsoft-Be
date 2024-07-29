import Joi from 'joi';

export const returnOrderSchema = Joi.object({
  account_id: Joi.string().allow('').optional(),
  is_return_update: Joi.string().allow().required(),
  status: Joi.string().allow().optional(),
  is_order_issue: Joi.string().allow().optional(),
});
