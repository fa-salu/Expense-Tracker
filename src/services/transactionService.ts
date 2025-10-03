import { db } from "@/db/client";
import {
  transactions,
  categories,
  type Transaction,
  type NewTransaction,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface TransactionWithCategory extends Transaction {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}

export class TransactionService {
  static async getByUserId(userId: number): Promise<TransactionWithCategory[]> {
    return await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        categoryId: transactions.categoryId,
        userId: transactions.userId,
        date: transactions.date,
        createdAt: transactions.createdAt,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
  }

  static async create(data: NewTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(data).returning();
    return result[0];
  }

  static async update(
    id: number,
    data: Partial<NewTransaction>
  ): Promise<Transaction> {
    const result = await db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  static async getById(id: number): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    return result[0] || null;
  }
}
