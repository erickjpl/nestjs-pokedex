export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  dbHost: process.env.MONGODB_HOST,
  dbPort: process.env.MONGODB_PORT,
  dbName: process.env.MONGODB_DB_NAME,
  mongodb: process.env.MONGODB_URL,
  port: process.env.PORT || 3000,
  defaultPaginationLimit: process.env.DEFAULT_PAGINATION_LIMIT || 5,
});
