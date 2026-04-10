import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: varchar({length: 22}).primaryKey(),
    name: varchar({ length: 255 }).notNull(),
});
