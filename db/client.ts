import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const expo = openDatabaseSync("expense_tracker.db");
export const db = drizzle(expo, { schema });

export const initializeDatabase = async () => {
  try {
    console.log("🔄 Starting database initialization...");

    // Drop tables for fresh start
    try {
      await expo.execAsync(`DROP TABLE IF EXISTS transactions;`);
      await expo.execAsync(`DROP TABLE IF EXISTS categories;`);
      await expo.execAsync(`DROP TABLE IF EXISTS users;`);
      console.log("✅ Dropped existing tables");
    } catch (dropError) {
      console.log("ℹ️ No existing tables to drop");
    }

    // Create users table
    await expo.execAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create categories table
    await expo.execAsync(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create transactions table
    await expo.execAsync(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        amount TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Create indexes
    await expo.execAsync(
      `CREATE UNIQUE INDEX users_email_unique ON users (email);`
    );
    await expo.execAsync(
      `CREATE INDEX categories_user_id_idx ON categories (user_id);`
    );
    await expo.execAsync(
      `CREATE INDEX transactions_user_id_idx ON transactions (user_id);`
    );
    await expo.execAsync(
      `CREATE INDEX transactions_category_id_idx ON transactions (category_id);`
    );

    console.log("✅ Created tables and indexes");

    // Insert default categories for all users
    await insertDefaultCategories();

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

const insertDefaultCategories = async () => {
  const defaultCategories = [
    { name: "Food", icon: "🍽️", color: "#FF6B6B", type: "expense" },
    { name: "Transport", icon: "🚗", color: "#4ECDC4", type: "expense" },
    { name: "Shopping", icon: "🛍️", color: "#45B7D1", type: "expense" },
    { name: "Entertainment", icon: "🎬", color: "#96CEB4", type: "expense" },
    { name: "Bills", icon: "💡", color: "#FFEAA7", type: "expense" },
    { name: "Salary", icon: "💰", color: "#00B894", type: "income" },
    { name: "Business", icon: "💼", color: "#00CEC9", type: "income" },
    { name: "Investment", icon: "📈", color: "#6C5CE7", type: "income" },
  ];

  try {
    for (const category of defaultCategories) {
      await expo.runAsync(
        `INSERT INTO categories (name, icon, color, type, user_id)
         SELECT ?, ?, ?, ?, users.id FROM users`,
        [category.name, category.icon, category.color, category.type]
      );
    }
    console.log("✅ Default categories inserted");
  } catch (error) {
    console.log("ℹ️ Categories might already exist", error);
  }
};
