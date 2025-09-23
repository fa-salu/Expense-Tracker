import { transactionRepository } from "../repositories/TransactionRepository";
import { DatabaseError } from "../database/errors/DatabaseErrors";

export class TransactionService {
  async createTransaction(userId, transactionData) {
    try {
      return await transactionRepository.create(userId, transactionData);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to save transaction", error);
    }
  }

  async getTransactions(userId, options = {}) {
    try {
      return await transactionRepository.findByUserId(userId, options);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      return [];
    }
  }

  async deleteTransaction(transactionId, userId) {
    try {
      return await transactionRepository.deleteById(transactionId, userId);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete transaction", error);
    }
  }

  async updateTransaction(transactionId, userId, transactionData) {
    try {
      return await transactionRepository.updateById(
        transactionId,
        userId,
        transactionData
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to update transaction", error);
    }
  }

  calculateSummary(transactions) {
    try {
      if (!Array.isArray(transactions)) {
        return { totalIncome: 0, totalExpenses: 0, balance: 0 };
      }

      const summary = transactions.reduce(
        (acc, transaction) => {
          const amount = parseFloat(transaction.amount) || 0;

          if (transaction.type === "income") {
            acc.totalIncome += amount;
          } else if (transaction.type === "expense") {
            acc.totalExpenses += amount;
          }

          return acc;
        },
        { totalIncome: 0, totalExpenses: 0 }
      );

      summary.balance = summary.totalIncome - summary.totalExpenses;
      return summary;
    } catch (error) {
      return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }
  }

  async getUserSummary(userId) {
    try {
      const transactions = await this.getTransactions(userId);
      return this.calculateSummary(transactions);
    } catch (error) {
      throw new DatabaseError("Failed to get user summary", error);
    }
  }
}

export const transactionService = new TransactionService();
