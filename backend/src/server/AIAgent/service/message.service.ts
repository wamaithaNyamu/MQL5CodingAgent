import { eq, asc } from 'drizzle-orm';
import redis from 'redis';

import { db } from '../../../config/db/db.postgres';
import { messagesTable } from '../models/message.models';
import { createMessageSchema } from '../models/message.models';
import { redisHost, redisPort } from "../../../config/envVariables.config";
const redisUrl = `redis://${redisHost}:${redisPort}`;




export const createMessage = async (data: unknown) => {
  // console.log("📝 createMessage function called with data:", data);
  const parsed = createMessageSchema.safeParse(data);
  if (!parsed.success) {
    console.error("❌ createMessage: Invalid data received:", parsed.error);
    throw parsed.error;
  }

  // ✅ Destructure ALL fields, including the new optional ones
  const {
    conversationId,
    content,
    role,
    next,
    tool,
    args,
    signedUrl,
    confirmed,    // ✅ NEW
    rejected,     // ✅ NEW
    paymentstatus, // ✅ NEW
    paymentfailed // ✅ NEW
  } = parsed.data;

  // Ensure 'content' is always a string after Zod parsing/transformation
  const messageContent = typeof content === 'string' ? content : JSON.stringify(content);

  // --- THIS IS THE CRITICAL BLOCK TO VERIFY ---
  if (role === 'user') {
    // console.log("🚫🚫🚫🚫🚫 BACKEND: User message detected. Storing to DB ONLY. NO REDIS PUBLISH. 🚫🚫🚫🚫🚫");
    const [createdUserMessage] = await db.insert(messagesTable).values({
      conversationId,
      content: messageContent, // Use processed messageContent
      role,
      ...(next && { next }),
      ...(tool && { tool }),
      ...(args && { args }),
      ...(signedUrl !== undefined && { signedUrl }), // Include if present, even if null
      ...(confirmed !== undefined && { confirmed }), // ✅ NEW: Include if present, even if null
      ...(rejected !== undefined && { rejected }),   // ✅ NEW: Include if present, even if null
      ...(paymentstatus !== undefined && { paymentstatus }), // ✅ NEW: Include if present, even if null
      ...(paymentfailed !== undefined && { paymentfailed })  // ✅ NEW: Include if present, even if null
    }).returning();
    console.log("✅ User message inserted into DB:", createdUserMessage);

    // return the Zep context for user messages
    return createdUserMessage; // IMPORTANT: Return here, do not proceed to Redis publish
  }
  // --- END OF CRITICAL BLOCK ---

  // The code below this point should ONLY execute for 'assistant' messages.
  // Ensure that 'content' is not empty or undefined here if you want to skip publishing empty messages
  if (!messageContent || messageContent.trim() === '') {
    console.warn("⚠️ createMessage: Skipping message creation/publish due to empty content.");
    return null;
  }

  const [created] = await db.insert(messagesTable).values({
    conversationId,
    content: messageContent, // Use processed messageContent
    role, // This will be 'assistant' here now
    ...(next && { next }),
    ...(tool && { tool }),
    ...(args && { args }),
    ...(signedUrl !== undefined && { signedUrl }), // Include if present, even if null
    ...(confirmed !== undefined && { confirmed }),    // ✅ NEW
    ...(rejected !== undefined && { rejected }),      // ✅ NEW
    ...(paymentstatus !== undefined && { paymentstatus }), // ✅ NEW
    ...(paymentfailed !== undefined && { paymentfailed })  // ✅ NEW
  }).returning();

  // console.log("✅ Assistant message inserted into DB:", created);

  if (created && created.id && created.content) {
    const publisher = redis.createClient({ url: redisUrl });
    await publisher.connect();

    const dataToPublish = {
      conversationId: created.conversationId,
      message: {
        id: created.id,
        content: created.content,
        role: created.role,
        timestamp: created.timestamp ? created.timestamp.toISOString() : new Date().toISOString(),
        tool: created.tool,
        args: created.args,
        next: created.next,
        signedUrl: created.signedUrl,
        confirmed: created.confirmed,       // ✅ NEW
        rejected: created.rejected,         // ✅ NEW
        paymentstatus: created.paymentstatus, // ✅ NEW
        paymentfailed: created.paymentfailed  // ✅ NEW
      },
    };

    // console.log("🚀 Publishing VALID ASSISTANT message to Redis:", dataToPublish);
    await publisher.publish("new-message", JSON.stringify(dataToPublish));
    await publisher.quit();


    console.log("✅ createMessage: Assistant message created and published successfully.");
    console.log("📤 Redis publish successful for assistant message:", created.id);

  } else {
    console.warn("⚠️ createMessage: Skipping Redis publish as 'created' assistant message is incomplete or empty:", created);
  }

  // console.log("Message creation process finished for:", created?.id);
  // Add Zep context for the assistant message

  return created;
};


export const getMessageByID = async (id: string) => {
  return await db.select({})
    .from(messagesTable)
    .where(eq(messagesTable.id, id))
    .limit(1)
    .then(results => results[0] || null);
};



export const getAllMessagesByConversationById = async (id: string) => {
  if (!id) throw new Error("Conversation ID is required to fetch messages");

  // Fetch messages associated with the conversation ID
  return await db.select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.timestamp))
    .then(results => results || []);
};

// ✅ Update a message by ID
export const updateMessageByID = async (id: string, data: Partial<typeof messagesTable.$inferInsert>) => {
  console.log("🛠️ Updating message with ID:", id);
  console.log("📝 Update data:", data);

  const result = await db.update(messagesTable)
    .set(data)
    .where(eq(messagesTable.id, id))
    .returning(); // 🪄 This returns the updated row(s)

  const updated = result[0] || null;

  console.log("✅ Updated message:", updated);
  return updated;
};
