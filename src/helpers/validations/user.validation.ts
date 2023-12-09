import * as Joi from 'joi';

const userValidationSchema = Joi.object({
  username: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export { userValidationSchema };
