import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { db } from "@/db/client";
import { users, type NewUser, type User } from "@/db/schema";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export class AuthService {
  private static async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const newUser: NewUser = {
      email,
      password: hashedPassword,
      name,
    };

    const result = await db.insert(users).values(newUser).returning();
    const user = result[0];

    // Store auth data
    await this.storeAuthData(user);
    return user;
  }

  static async login(email: string, password: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result[0];

    if (user.password !== hashedPassword) {
      throw new Error("Invalid email or password");
    }

    // Store auth data
    await this.storeAuthData(user);
    return user;
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  }

  private static async storeAuthData(user: User): Promise<void> {
    const token = await Crypto.randomUUID();
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }
}
