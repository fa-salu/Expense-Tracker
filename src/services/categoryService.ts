import { db } from "@/db/client";
import { categories, type Category, type NewCategory } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class CategoryService {
  static async getByUserId(userId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  }

  static async getByType(
    userId: number,
    type: "income" | "expense"
  ): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.type, type)))
      .orderBy(categories.name);
  }

  static async create(data: NewCategory): Promise<Category> {
    const result = await db.insert(categories).values(data).returning();
    return result[0];
  }

  static async update(
    id: number,
    data: Partial<NewCategory>
  ): Promise<Category> {
    const result = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  static async getById(id: number): Promise<Category | null> {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return result[0] || null;
  }
}
