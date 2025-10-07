import { db } from "@/db/client";
import {
  transactions,
  categories,
  type Transaction,
  type NewTransaction,
} from "@/db/schema";
import { eq, desc, and, gte, lte, inArray, or } from "drizzle-orm";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: "income" | "expense" | "all";
  categoryIds?: number[];
}

export interface TransactionWithCategory extends Transaction {
  categoryName: string;
  categoryColor: string;
}

export class TransactionService {
  static async getByUserId(
    userId: number,
    filters?: TransactionFilters
  ): Promise<TransactionWithCategory[]> {
    const conditions: any[] = [eq(transactions.userId, userId)];

    if (filters?.dateFrom) {
      conditions.push(gte(transactions.date, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(transactions.date, filters.dateTo));
    }

    if (filters?.type && filters.type !== "all") {
      conditions.push(eq(transactions.type, filters.type));
    }

    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      conditions.push(inArray(transactions.categoryId, filters.categoryIds));
    }

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
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
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
