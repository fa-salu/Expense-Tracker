import * as SQLite from "expo-sqlite";
import { DB_NAME, DatabaseConfig } from "../../database/database";
import { ConnectionError } from "../errors/DatabaseErrors";
import { logger } from "../utils/Logger";

export class DatabaseManager {
  constructor() {
    this.isInitialized = false;
  }

  async executeWithConnection(operation, operationName = "Unknown") {
    const maxRetries = DatabaseConfig.maxRetries;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let db = null;

      try {
        logger.info(`${operationName} - Attempt ${attempt}/${maxRetries}`);

        if (attempt > 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, DatabaseConfig.retryDelay * attempt)
          );
        }

        db = await SQLite.openDatabaseAsync(DB_NAME);
        logger.info(`${operationName} - Database connection opened`);

        const result = await operation(db);
        logger.info(`${operationName} - Operation completed successfully`);

        return result;
      } catch (error) {
        lastError = error;
        logger.error(`${operationName} - Attempt ${attempt} failed`, error);

        if (this.isCriticalError(error)) {
          logger.error(
            `${operationName} - Critical error, not retrying`,
            error
          );
          break;
        }

        if (attempt === maxRetries) {
          logger.error(`${operationName} - All attempts failed`, error);
        }
      } finally {
        if (db) {
          try {
            await db.closeAsync();
            logger.info(`${operationName} - Database connection closed`);
          } catch (closeError) {
            logger.warn(
              `${operationName} - Failed to close connection`,
              closeError
            );
          }
        }
      }
    }

    throw new ConnectionError(
      `${operationName} failed after ${maxRetries} attempts`,
      lastError
    );
  }

  isCriticalError(error) {
    const criticalErrorPatterns = [
      "UNIQUE constraint failed",
      "no such table",
      "syntax error",
      "database is locked",
    ];

    return criticalErrorPatterns.some((pattern) =>
      error.message?.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  async initialize() {
    if (this.isInitialized) {
      logger.info("Database already initialized");
      return;
    }

    await this.executeWithConnection(async (db) => {
      logger.info("Creating database schema...");

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA temp_store = memory;
        PRAGMA synchronous = NORMAL;

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          amount REAL NOT NULL CHECK (amount > 0),
          description TEXT DEFAULT '',
          category TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
      `);

      logger.info("Database schema created successfully");
      this.isInitialized = true;
    }, "Database Initialization");
  }
}

export const dbManager = new DatabaseManager();
