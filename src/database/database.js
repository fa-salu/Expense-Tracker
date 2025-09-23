// import * as SQLite from "expo-sqlite";

export const DB_NAME = "expense_tracker.db";

// class DatabaseError extends Error {
//   constructor(message, originalError = null) {
//     super(message);
//     this.name = "DatabaseError";
//     this.originalError = originalError;
//   }
// }

// class ConnectionError extends DatabaseError {
//   constructor(message, originalError = null) {
//     super(message, originalError);
//     this.name = "ConnectionError";
//   }
// }

// class QueryError extends DatabaseError {
//   constructor(message, originalError = null) {
//     super(message, originalError);
//     this.name = "QueryError";
//   }
// }

export const DatabaseConfig = {
  maxRetries: 3,
  retryDelay: 500,
  connectionTimeout: 10000,
  enableLogging: __DEV__,
};

// const logger = {
//   info: (message, ...args) => {
//     if (DatabaseConfig.enableLogging) {
//       console.log(`[DB] ${message}`, ...args);
//     }
//   },
//   error: (message, error) => {
//     if (DatabaseConfig.enableLogging) {
//       console.error(`[DB ERROR] ${message}`, error);
//     }
//   },
//   warn: (message, ...args) => {
//     if (DatabaseConfig.enableLogging) {
//       console.warn(`[DB WARN] ${message}`, ...args);
//     }
//   },
// };

// class DatabaseManager {
//   constructor() {
//     this.isInitialized = false;
//   }

//   async executeWithConnection(operation, operationName = "Unknown") {
//     const maxRetries = DatabaseConfig.maxRetries;
//     let lastError = null;

//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//       let db = null;

//       try {
//         logger.info(`${operationName} - Attempt ${attempt}/${maxRetries}`);

//         if (attempt > 1) {
//           await new Promise((resolve) =>
//             setTimeout(resolve, DatabaseConfig.retryDelay * attempt)
//           );
//         }

//         db = await SQLite.openDatabaseAsync(DB_NAME);
//         logger.info(`${operationName} - Database connection opened`);

//         const result = await operation(db);
//         logger.info(`${operationName} - Operation completed successfully`);

//         return result;
//       } catch (error) {
//         lastError = error;
//         logger.error(`${operationName} - Attempt ${attempt} failed`, error);

//         if (this.isCriticalError(error)) {
//           logger.error(
//             `${operationName} - Critical error, not retrying`,
//             error
//           );
//           break;
//         }

//         if (attempt === maxRetries) {
//           logger.error(`${operationName} - All attempts failed`, error);
//         }
//       } finally {
//         if (db) {
//           try {
//             await db.closeAsync();
//             logger.info(`${operationName} - Database connection closed`);
//           } catch (closeError) {
//             logger.warn(
//               `${operationName} - Failed to close connection`,
//               closeError
//             );
//           }
//         }
//       }
//     }

//     throw new ConnectionError(
//       `${operationName} failed after ${maxRetries} attempts`,
//       lastError
//     );
//   }

//   isCriticalError(error) {
//     const criticalErrorPatterns = [
//       "UNIQUE constraint failed",
//       "no such table",
//       "syntax error",
//       "database is locked",
//     ];

//     return criticalErrorPatterns.some((pattern) =>
//       error.message?.toLowerCase().includes(pattern.toLowerCase())
//     );
//   }

//   async initialize() {
//     if (this.isInitialized) {
//       logger.info("Database already initialized");
//       return;
//     }

//     await this.executeWithConnection(async (db) => {
//       logger.info("Creating database schema...");

//       await db.execAsync(`
//         PRAGMA journal_mode = WAL;
//         PRAGMA foreign_keys = ON;
//         PRAGMA temp_store = memory;
//         PRAGMA synchronous = NORMAL;

//         CREATE TABLE IF NOT EXISTS users (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           phone_number TEXT UNIQUE NOT NULL,
//           password TEXT NOT NULL,
//           created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
//         );

//         CREATE TABLE IF NOT EXISTS transactions (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           user_id INTEGER NOT NULL,
//           type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
//           amount REAL NOT NULL CHECK (amount > 0),
//           description TEXT DEFAULT '',
//           category TEXT NOT NULL,
//           created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//           FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
//         );

//         CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
//         CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
//         CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
//         CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
//       `);

//       logger.info("Database schema created successfully");
//       this.isInitialized = true;
//     }, "Database Initialization");
//   }
// }

// const dbManager = new DatabaseManager();

// export const initDatabase = async () => {
//   try {
//     await dbManager.initialize();
//     logger.info("Database initialization completed");
//   } catch (error) {
//     logger.error("Database initialization failed", error);
//     throw new DatabaseError("Failed to initialize database", error);
//   }
// };

// export const registerUser = async (phoneNumber, password) => {
//   try {
//     if (!phoneNumber?.trim()) {
//       throw new DatabaseError("Phone number is required");
//     }
//     if (!password?.trim()) {
//       throw new DatabaseError("Password is required");
//     }
//     if (password.trim().length < 4) {
//       throw new DatabaseError("Password must be at least 4 characters long");
//     }

//     const cleanPhone = phoneNumber.trim();
//     const cleanPassword = password.trim();

//     logger.info("Registering user", { phone: cleanPhone });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       const existingUsers = await db.getAllAsync(
//         "SELECT id FROM users WHERE phone_number = ?",
//         [cleanPhone]
//       );

//       if (existingUsers.length > 0) {
//         throw new DatabaseError("Phone number already registered");
//       }

//       const insertResult = await db.runAsync(
//         "INSERT INTO users (phone_number, password, created_at) VALUES (?, ?, ?)",
//         [cleanPhone, cleanPassword, new Date().toISOString()]
//       );

//       return {
//         id: insertResult.lastInsertRowId,
//         phone_number: cleanPhone,
//         created_at: new Date().toISOString(),
//       };
//     }, "User Registration");

//     logger.info("User registered successfully", { userId: result.id });
//     return result;
//   } catch (error) {
//     logger.error("User registration failed", error);

//     if (error instanceof DatabaseError) {
//       throw error;
//     }

//     if (error.message?.includes("UNIQUE constraint failed")) {
//       throw new DatabaseError("Phone number already registered");
//     }

//     throw new DatabaseError("Registration failed", error);
//   }
// };

// export const loginUser = async (phoneNumber, password) => {
//   try {
//     if (!phoneNumber?.trim()) {
//       throw new DatabaseError("Phone number is required");
//     }
//     if (!password?.trim()) {
//       throw new DatabaseError("Password is required");
//     }

//     const cleanPhone = phoneNumber.trim();
//     const cleanPassword = password.trim();

//     logger.info("User login attempt", { phone: cleanPhone });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       const users = await db.getAllAsync(
//         "SELECT id, phone_number, created_at FROM users WHERE phone_number = ? AND password = ?",
//         [cleanPhone, cleanPassword]
//       );

//       if (!users || users.length === 0) {
//         throw new DatabaseError("Invalid phone number or password");
//       }

//       return users[0];
//     }, "User Login");

//     logger.info("User login successful", { userId: result.id });
//     return result;
//   } catch (error) {
//     logger.error("User login failed", error);

//     if (error instanceof DatabaseError) {
//       throw error;
//     }

//     throw new DatabaseError("Login failed", error);
//   }
// };

// export const saveTransaction = async (userId, transaction) => {
//   try {
//     if (!userId) {
//       throw new DatabaseError("User ID is required");
//     }
//     if (!transaction) {
//       throw new DatabaseError("Transaction data is required");
//     }
//     if (
//       !transaction.type ||
//       !["income", "expense"].includes(transaction.type)
//     ) {
//       throw new DatabaseError(
//         "Valid transaction type is required (income or expense)"
//       );
//     }
//     if (!transaction.amount || parseFloat(transaction.amount) <= 0) {
//       throw new DatabaseError("Valid amount is required");
//     }
//     if (!transaction.category?.trim()) {
//       throw new DatabaseError("Category is required");
//     }

//     const transactionData = {
//       user_id: userId,
//       type: transaction.type,
//       amount: parseFloat(transaction.amount),
//       description: transaction.description?.trim() || "",
//       category: transaction.category.trim(),
//       created_at: transaction.createdAt || new Date().toISOString(),
//     };

//     logger.info("Saving transaction", {
//       userId,
//       type: transactionData.type,
//       amount: transactionData.amount,
//     });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       const insertResult = await db.runAsync(
//         `INSERT INTO transactions (user_id, type, amount, description, category, created_at)
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           transactionData.user_id,
//           transactionData.type,
//           transactionData.amount,
//           transactionData.description,
//           transactionData.category,
//           transactionData.created_at,
//         ]
//       );

//       return {
//         id: insertResult.lastInsertRowId,
//         ...transactionData,
//       };
//     }, "Save Transaction");

//     logger.info("Transaction saved successfully", { transactionId: result.id });
//     return result;
//   } catch (error) {
//     logger.error("Save transaction failed", error);

//     if (error instanceof DatabaseError) {
//       throw error;
//     }

//     throw new DatabaseError("Failed to save transaction", error);
//   }
// };

// export const getTransactions = async (userId, options = {}) => {
//   try {
//     if (!userId) {
//       throw new DatabaseError("User ID is required");
//     }

//     const {
//       limit = null,
//       offset = 0,
//       type = null,
//       startDate = null,
//       endDate = null,
//     } = options;

//     logger.info("Getting transactions", { userId, options });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       let query = "SELECT * FROM transactions WHERE user_id = ?";
//       const params = [userId];

//       if (type) {
//         query += " AND type = ?";
//         params.push(type);
//       }

//       if (startDate) {
//         query += " AND created_at >= ?";
//         params.push(startDate);
//       }

//       if (endDate) {
//         query += " AND created_at <= ?";
//         params.push(endDate);
//       }

//       query += " ORDER BY created_at DESC";

//       if (limit) {
//         query += " LIMIT ? OFFSET ?";
//         params.push(limit, offset);
//       }

//       const transactions = await db.getAllAsync(query, params);

//       return transactions.map((row) => ({
//         id: row.id.toString(),
//         user_id: row.user_id,
//         type: row.type,
//         amount: parseFloat(row.amount),
//         description: row.description || "",
//         category: row.category,
//         createdAt: row.created_at,
//         date: row.created_at, // Backward compatibility
//       }));
//     }, "Get Transactions");

//     logger.info("Retrieved transactions", { userId, count: result.length });
//     return result;
//   } catch (error) {
//     logger.error("Get transactions failed", error);

//     if (error instanceof DatabaseError) {
//       throw error;
//     }

//     logger.warn("Returning empty array due to error");
//     return [];
//   }
// };

// export const deleteTransaction = async (transactionId, userId) => {
//   try {
//     if (!transactionId) {
//       throw new DatabaseError("Transaction ID is required");
//     }
//     if (!userId) {
//       throw new DatabaseError("User ID is required");
//     }

//     logger.info("Deleting transaction", { transactionId, userId });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       const deleteResult = await db.runAsync(
//         "DELETE FROM transactions WHERE id = ? AND user_id = ?",
//         [transactionId, userId]
//       );

//       return deleteResult.changes > 0;
//     }, "Delete Transaction");

//     logger.info("Transaction deletion result", {
//       transactionId,
//       success: result,
//     });
//     return result;
//   } catch (error) {
//     logger.error("Delete transaction failed", error);

//     if (error instanceof DatabaseError) {
//       throw error;
//     }

//     throw new DatabaseError("Failed to delete transaction", error);
//   }
// };

// export const updateTransaction = async (transactionId, userId, transaction) => {
//   try {
//     if (!transactionId) {
//       throw new DatabaseError("Transaction ID is required");
//     }
//     if (!userId) {
//       throw new DatabaseError("User ID is required");
//     }
//     if (!transaction) {
//       throw new DatabaseError("Transaction data is required");
//     }

//     logger.info("Updating transaction", { transactionId, userId });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       const updateResult = await db.runAsync(
//         `UPDATE transactions
//          SET type = ?, amount = ?, description = ?, category = ?
//          WHERE id = ? AND user_id = ?`,
//         [
//           transaction.type,
//           parseFloat(transaction.amount),
//           transaction.description?.trim() || "",
//           transaction.category?.trim() || "",
//           transactionId,
//           userId,
//         ]
//       );

//       return updateResult.changes > 0;
//     }, "Update Transaction");

//     logger.info("Transaction update result", {
//       transactionId,
//       success: result,
//     });
//     return result;
//   } catch (error) {
//     logger.error("Update transaction failed", error);

//     if (error instanceof DatabaseError) {
//       throw error;
//     }

//     throw new DatabaseError("Failed to update transaction", error);
//   }
// };

// export const getUserById = async (userId) => {
//   try {
//     if (!userId) {
//       throw new DatabaseError("User ID is required");
//     }

//     logger.info("Getting user by ID", { userId });

//     const result = await dbManager.executeWithConnection(async (db) => {
//       const users = await db.getAllAsync(
//         "SELECT id, phone_number, created_at FROM users WHERE id = ?",
//         [userId]
//       );

//       return users.length > 0 ? users[0] : null;
//     }, "Get User By ID");

//     return result;
//   } catch (error) {
//     logger.error("Get user by ID failed", error);
//     return null;
//   }
// };

// export const calculateSummary = (transactions) => {
//   try {
//     if (!Array.isArray(transactions)) {
//       logger.warn("Invalid transactions data for summary calculation");
//       return { totalIncome: 0, totalExpenses: 0, balance: 0 };
//     }

//     const summary = transactions.reduce(
//       (acc, transaction) => {
//         const amount = parseFloat(transaction.amount) || 0;

//         if (transaction.type === "income") {
//           acc.totalIncome += amount;
//         } else if (transaction.type === "expense") {
//           acc.totalExpenses += amount;
//         }

//         return acc;
//       },
//       { totalIncome: 0, totalExpenses: 0 }
//     );

//     summary.balance = summary.totalIncome - summary.totalExpenses;

//     logger.info("Summary calculated", summary);
//     return summary;
//   } catch (error) {
//     logger.error("Calculate summary failed", error);
//     return { totalIncome: 0, totalExpenses: 0, balance: 0 };
//   }
// };

// export const getUserSummary = async (userId) => {
//   try {
//     const transactions = await getTransactions(userId);
//     return calculateSummary(transactions);
//   } catch (error) {
//     logger.error("Get user summary failed", error);
//     throw new DatabaseError("Failed to get user summary", error);
//   }
// };

// export { DatabaseError, ConnectionError, QueryError };
