import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const expo = openDatabaseSync("expense_tracker.db");
export const db = drizzle(expo, { schema });

export const initializeDatabase = async () => {
  try {
    console.log("🔄 Starting database initialization...");

    // First, drop the table if it exists (for fresh start)
    try {
      await expo.execAsync(`DROP TABLE IF EXISTS users;`);
      console.log("✅ Dropped existing users table");
    } catch (dropError) {
      console.log("ℹ️ No existing table to drop");
    }

    // Create the users table
    await expo.execAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Created users table");

    // Create unique index
    await expo.execAsync(`
      CREATE UNIQUE INDEX users_email_unique ON users (email);
    `);
    console.log("✅ Created email unique index");

    // Verify table was created by checking schema
    const tableInfo = await expo.getAllAsync(`
      SELECT sql FROM sqlite_master WHERE type='table' AND name='users';
    `);
    console.log("✅ Table schema:", tableInfo);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};
