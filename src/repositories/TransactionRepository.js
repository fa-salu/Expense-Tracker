import { dbManager } from "../database/managers/DatabaseManager";
import { DatabaseError } from "../database/errors/DatabaseErrors";
import { Transaction } from "../database/models/Trasaction";
import { logger } from "../database/utils/Logger";

export class TransactionRepository {
  async create(userId, transactionData) {
    if (!userId) {
      throw new DatabaseError("User ID is required");
    }
    if (!transactionData) {
      throw new DatabaseError("Transaction data is required");
    }
    if (
      !transactionData.type ||
      !["income", "expense"].includes(transactionData.type)
    ) {
      throw new DatabaseError(
        "Valid transaction type is required (income or expense)"
      );
    }
    if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
      throw new DatabaseError("Valid amount is required");
    }
    if (!transactionData.category?.trim()) {
      throw new DatabaseError("Category is required");
    }

    const data = {
      user_id: userId,
      type: transactionData.type,
      amount: parseFloat(transactionData.amount),
      description: transactionData.description?.trim() || "",
      category: transactionData.category.trim(),
      created_at: transactionData.createdAt || new Date().toISOString(),
    };

    logger.info("Creating transaction", {
      userId,
      type: data.type,
      amount: data.amount,
    });

    const result = await dbManager.executeWithConnection(async (db) => {
      const insertResult = await db.runAsync(
        `INSERT INTO transactions (user_id, type, amount, description, category, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.user_id,
          data.type,
          data.amount,
          data.description,
          data.category,
          data.created_at,
        ]
      );

      return new Transaction({
        id: insertResult.lastInsertRowId,
        ...data,
      });
    }, "Create Transaction");

    logger.info("Transaction created successfully", {
      transactionId: result.id,
    });
    return result;
  }

  async findByUserId(userId, options = {}) {
    if (!userId) {
      throw new DatabaseError("User ID is required");
    }

    const {
      limit = null,
      offset = 0,
      type = null,
      startDate = null,
      endDate = null,
    } = options;

    logger.info("Finding transactions by user ID", { userId, options });

    const result = await dbManager.executeWithConnection(async (db) => {
      let query = "SELECT * FROM transactions WHERE user_id = ?";
      const params = [userId];

      if (type) {
        query += " AND type = ?";
        params.push(type);
      }

      if (startDate) {
        query += " AND created_at >= ?";
        params.push(startDate);
      }

      if (endDate) {
        query += " AND created_at <= ?";
        params.push(endDate);
      }

      query += " ORDER BY created_at DESC";

      if (limit) {
        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);
      }

      const transactions = await db.getAllAsync(query, params);
      return transactions.map((row) => Transaction.fromDatabase(row));
    }, "Get Transactions");

    logger.info("Retrieved transactions", { userId, count: result.length });
    return result;
  }

  async deleteById(transactionId, userId) {
    if (!transactionId) {
      throw new DatabaseError("Transaction ID is required");
    }
    if (!userId) {
      throw new DatabaseError("User ID is required");
    }

    logger.info("Deleting transaction", { transactionId, userId });

    const result = await dbManager.executeWithConnection(async (db) => {
      const deleteResult = await db.runAsync(
        "DELETE FROM transactions WHERE id = ? AND user_id = ?",
        [transactionId, userId]
      );

      return deleteResult.changes > 0;
    }, "Delete Transaction");

    logger.info("Transaction deletion result", {
      transactionId,
      success: result,
    });
    return result;
  }

  async updateById(transactionId, userId, transactionData) {
    if (!transactionId) {
      throw new DatabaseError("Transaction ID is required");
    }
    if (!userId) {
      throw new DatabaseError("User ID is required");
    }
    if (!transactionData) {
      throw new DatabaseError("Transaction data is required");
    }

    logger.info("Updating transaction", { transactionId, userId });

    const result = await dbManager.executeWithConnection(async (db) => {
      const updateResult = await db.runAsync(
        `UPDATE transactions 
         SET type = ?, amount = ?, description = ?, category = ?
         WHERE id = ? AND user_id = ?`,
        [
          transactionData.type,
          parseFloat(transactionData.amount),
          transactionData.description?.trim() || "",
          transactionData.category?.trim() || "",
          transactionId,
          userId,
        ]
      );

      return updateResult.changes > 0;
    }, "Update Transaction");

    logger.info("Transaction update result", {
      transactionId,
      success: result,
    });
    return result;
  }
}

export const transactionRepository = new TransactionRepository();
