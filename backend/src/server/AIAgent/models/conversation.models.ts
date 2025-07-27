import { text, timestamp, uuid,pgSchema } from 'drizzle-orm/pg-core';
import { z } from 'zod';
// 👇 Add this
const drizzleSchema = pgSchema("drizzle");


export const conversationsTable = drizzleSchema.table('conversations', {
  id: uuid('id').primaryKey().defaultRandom(), // conversationID
  title: text('title').notNull(),              // conversationTitle
  createdAt: timestamp('created_at').defaultNow(),
});

export const createConversationSchema = z.object({
  title: z.string().min(1),
});

export const updateConversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
});

