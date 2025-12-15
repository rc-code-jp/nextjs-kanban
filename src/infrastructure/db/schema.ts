import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const columns = sqliteTable("columns", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  columnId: text("column_id")
    .notNull()
    .references(() => columns.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
