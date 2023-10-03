import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  PORT: Joi.number().default(3005),
  DEFAULT_PAGINATION_LIMIT: Joi.number().default(5),
  MONGODB_HOST: Joi.required(),
  MONGODB_PORT: Joi.required(),
  MONGODB_DB_NAME: Joi.required(),
  MONGODB_URL: Joi.required(),
});
