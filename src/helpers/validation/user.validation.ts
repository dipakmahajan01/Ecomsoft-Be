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
