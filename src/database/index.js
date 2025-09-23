import { dbManager } from "./managers/DatabaseManager";
import { DatabaseError } from "./errors/DatabaseErrors";
import { logger } from "./utils/Logger";

export const initDatabase = async () => {
  try {
    await dbManager.initialize();
    logger.info("Database initialization completed");
  } catch (error) {
    logger.error("Database initialization failed", error);
    throw new DatabaseError("Failed to initialize database", error);
  }
};

export { userService as UserService } from "../services/UserServices";
export { transactionService as TransactionService } from "../services/TransactionServices";

export * from "./errors/DatabaseErrors";

export const registerUser = async (phoneNumber, password) => {
  const { userService } = await import("../services/UserServices");
  return userService.register(phoneNumber, password);
};

export const loginUser = async (phoneNumber, password) => {
  const { userService } = await import("../services/UserServices");
  return userService.login(phoneNumber, password);
};

export const saveTransaction = async (userId, transaction) => {
  const { transactionService } = await import(
    "../services/TransactionServices"
  );
  return transactionService.createTransaction(userId, transaction);
};

export const getTransactions = async (userId, options = {}) => {
  const { transactionService } = await import(
    "../services/TransactionServices"
  );
  return transactionService.getTransactions(userId, options);
};

export const deleteTransaction = async (transactionId, userId) => {
  const { transactionService } = await import(
    "../services/TransactionServices"
  );
  return transactionService.deleteTransaction(transactionId, userId);
};

export const updateTransaction = async (transactionId, userId, transaction) => {
  const { transactionService } = await import(
    "../services/TransactionServices"
  );
  return transactionService.updateTransaction(
    transactionId,
    userId,
    transaction
  );
};

export const getUserById = async (userId) => {
  const { userService } = await import("../services/UserServices");
  return userService.getUserById(userId);
};

export const calculateSummary = (transactions) => {
  const { transactionService } = require("../services/TransactionServices");
  return transactionService.calculateSummary(transactions);
};

export const getUserSummary = async (userId) => {
  const { transactionService } = await import(
    "../services/TransactionServices"
  );
  return transactionService.getUserSummary(userId);
};
