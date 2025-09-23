import { userRepository } from "../repositories/UserRepository";
import { DatabaseError } from "../database/errors/DatabaseErrors";

export class UserService {
  async register(phoneNumber, password) {
    try {
      return await userRepository.create(phoneNumber, password);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new DatabaseError("Phone number already registered");
      }
      throw new DatabaseError("Registration failed", error);
    }
  }

  async login(phoneNumber, password) {
    try {
      return await userRepository.findByCredentials(phoneNumber, password);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Login failed", error);
    }
  }

  async getUserById(userId) {
    try {
      return await userRepository.findById(userId);
    } catch (error) {
      return null;
    }
  }
}

export const userService = new UserService();
