export const DB_NAME = "expense_tracker.db";

export const DatabaseConfig = {
  maxRetries: 3,
  retryDelay: 500,
  connectionTimeout: 10000,
  enableLogging: __DEV__,
};
