import { dbManager } from "../database/managers/DatabaseManager";
import { DatabaseError } from "../database/errors/DatabaseErrors";
import { User } from "../database/models/Users";
import { logger } from "../database/utils/Logger";

export class UserRepository {
  async create(phoneNumber, password) {
    if (!phoneNumber?.trim()) {
      throw new DatabaseError("Phone number is required");
    }
    if (!password?.trim()) {
      throw new DatabaseError("Password is required");
    }
    if (password.trim().length < 4) {
      throw new DatabaseError("Password must be at least 4 characters long");
    }

    const cleanPhone = phoneNumber.trim();
    const cleanPassword = password.trim();

    logger.info("Creating user", { phone: cleanPhone });

    const result = await dbManager.executeWithConnection(async (db) => {
      const existingUsers = await db.getAllAsync(
        "SELECT id FROM users WHERE phone_number = ?",
        [cleanPhone]
      );

      if (existingUsers.length > 0) {
        throw new DatabaseError("Phone number already registered");
      }

      const insertResult = await db.runAsync(
        "INSERT INTO users (phone_number, password, created_at) VALUES (?, ?, ?)",
        [cleanPhone, cleanPassword, new Date().toISOString()]
      );

      return new User({
        id: insertResult.lastInsertRowId,
        phone_number: cleanPhone,
        created_at: new Date().toISOString(),
      });
    }, "User Creation");

    logger.info("User created successfully", { userId: result.id });
    return result;
  }

  async findByCredentials(phoneNumber, password) {
    if (!phoneNumber?.trim()) {
      throw new DatabaseError("Phone number is required");
    }
    if (!password?.trim()) {
      throw new DatabaseError("Password is required");
    }

    const cleanPhone = phoneNumber.trim();
    const cleanPassword = password.trim();

    logger.info("Finding user by credentials", { phone: cleanPhone });

    const result = await dbManager.executeWithConnection(async (db) => {
      const users = await db.getAllAsync(
        "SELECT id, phone_number, created_at FROM users WHERE phone_number = ? AND password = ?",
        [cleanPhone, cleanPassword]
      );

      if (!users || users.length === 0) {
        throw new DatabaseError("Invalid phone number or password");
      }

      return User.fromDatabase(users[0]);
    }, "User Login");

    logger.info("User found successfully", { userId: result.id });
    return result;
  }

  async findById(userId) {
    if (!userId) {
      throw new DatabaseError("User ID is required");
    }

    logger.info("Finding user by ID", { userId });

    const result = await dbManager.executeWithConnection(async (db) => {
      const users = await db.getAllAsync(
        "SELECT id, phone_number, created_at FROM users WHERE id = ?",
        [userId]
      );

      return users.length > 0 ? User.fromDatabase(users[0]) : null;
    }, "Get User By ID");

    return result;
  }
}

export const userRepository = new UserRepository();
