export const logger = {
  info: (message, ...args) => {
    console.log(`[DB] ${message}`, ...args);
  },
  error: (message, error) => {
    console.error(`[DB ERROR] ${message}`, error);
  },
  warn: (message, ...args) => {
    console.warn(`[DB WARN] ${message}`, ...args);
  },
};
