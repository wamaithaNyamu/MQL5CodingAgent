import { pgSchema, text, uuid} from 'drizzle-orm/pg-core';

import { z } from 'zod';
import { conversationsTable } from './conversation.models';
import { messagesTable } from './message.models';
// 👇 Add this
const drizzleSchema = pgSchema("drizzle");

export const paymentsTable = drizzleSchema.table('payments', {
id: uuid('id').primaryKey().defaultRandom(),
conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversationsTable.id, { onDelete: 'cascade' }),
messageId: uuid('message_id')
    .notNull()
    .references(() => messagesTable.id, { onDelete: 'cascade' }),

reference : text("reference"),
trans : text("trans"),
status : text("status"),
message : text("message"),
transaction : text("transaction"),
trxref : text("trxref"),
redirecturl : text("redirecturl"),

});


export const createPaymentsSchema = z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
    reference: z.optional(z.string()),
    trans: z.optional(z.string()),
    status: z.optional(z.string()),
    message: z.optional(z.string()),
    transaction: z.optional(z.string()),
    trxref: z.optional(z.string()),
    redirecturl: z.optional(z.string())
});