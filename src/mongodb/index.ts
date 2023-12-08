import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

// Setup mongodb
const configs: any = {
  development: {
    connection: process.env.DATABASE_CONNECTION_URI_DEV,
  },

  test: {
    connection: process.env.DATABASE_CONNECTION_URI_TEST,
  },

  staging: {
    connection: process.env.DATABASE_CONNECTION_URI_STAGE,
  },
};

const config = configs[process.env.NODE_ENV || 'development'].connection;
/** Connect to Mongo */
export const mongooseConnection = async () => {
  mongoose.set('strictQuery', false)
  return await mongoose.connect(config, { retryWrites: true, w: 'majority' });
};
