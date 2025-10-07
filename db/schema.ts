import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: text("amount").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  date: text("date").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
