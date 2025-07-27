import { pgSchema, text, timestamp, uuid,jsonb ,boolean} from 'drizzle-orm/pg-core';

import { z } from 'zod';
import { conversationsTable } from './conversation.models';
// 👇 Add this
const drizzleSchema = pgSchema("drizzle");


export const messagesTable = drizzleSchema.table('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
 conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversationsTable.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  next : text("next"),
  tool : text("tool"),
  args: jsonb('args').default({}), // 👈 args as JSON with empty object default
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  signedUrl: boolean('signedUrl').default(false),
  confirmed: boolean('confirmed').default(false),
  rejected: boolean('rejected').default(false),
  paymentstatus: boolean('paymentstatus').default(false),
  paymentfailed: boolean('paymentfailed').default(false),
});


export const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content:z.union([
    z.string(),
    z.object({}).passthrough().transform(obj => JSON.stringify(obj))
  ]),
  next: z.optional(z.string()),
  tool: z.optional(z.string()),
  args: z.optional(z.record(z.any())), // allows args to be a JSON object (i.e., Record<string, any>)
  signedUrl: z.optional(z.boolean().nullable()), // Optional signed URL for the uploaded bot
  confirmed: z.optional(z.boolean().nullable()), // Optional signed URL for the uploaded bot
  rejected: z.optional(z.boolean().nullable()), // Optional signed URL for the uploaded bot
  paymentstatus: z.optional(z.boolean().nullable()), // Optional signed URL for the uploaded bot
  paymentfailed: z.optional(z.boolean().nullable()), // Optional signed URL for the uploaded bot

}

);