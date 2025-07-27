// lib/crud/payments.ts
import { eq } from "drizzle-orm";
import { db } from '../../../config/db/db.postgres';
import { paymentsTable } from "../models/payment.models";
import { z } from "zod";

// 🧪 Schema
export const createPaymentsSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
  reference: z.optional(z.string()),
  trans: z.optional(z.string()),
  status: z.optional(z.string()),
  message: z.optional(z.string()),
  transaction: z.optional(z.string()),
  trxref: z.optional(z.string()),
  redirecturl: z.optional(z.string()),
});

// ✅ Create
export const createPayment = async (input: z.infer<typeof createPaymentsSchema>) => {
  console.log("📦 Creating payment with data:", input);

  const result = await db
    .insert(paymentsTable)
    .values(input)
    .returning(); // returns the created row

  console.log("✅ Payment created:", result[0]);
  return result[0];
};

// 📄 Read
export const getPaymentById = async (id: string) => {
  console.log("🔍 Fetching payment by ID:", id);

  const result = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.id, id))
    .limit(1);

  return result[0] || null;
};

// 🛠️ Update
export const updatePaymentById = async (
  id: string,
  data: Partial<z.infer<typeof createPaymentsSchema>>
) => {
  console.log("🛠️ Updating payment ID:", id);
  console.log("🔧 Update data:", data);

  const result = await db
    .update(paymentsTable)
    .set(data)
    .where(eq(paymentsTable.id, id))
    .returning();

  return result[0] || null;
};

// ❌ Delete
export const deletePaymentById = async (id: string) => {
  console.log("🗑️ Deleting payment with ID:", id);

  const result = await db
    .delete(paymentsTable)
    .where(eq(paymentsTable.id, id))
    .returning();

  return result[0] || null;
};
