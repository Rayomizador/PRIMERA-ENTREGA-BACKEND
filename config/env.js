import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 8080,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '1d',
};

export default ENV;
