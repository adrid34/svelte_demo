import { pgTable, serial, integer, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const github_cache = pgTable('github_cache', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  data: jsonb('data').notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull()
});
