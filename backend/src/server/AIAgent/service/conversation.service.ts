import { eq } from 'drizzle-orm';
import { db } from '../../../config/db/db.postgres';
import { conversationsTable } from '../models/conversation.models';
import { createConversationSchema, updateConversationSchema } from '../models/conversation.models';
import { setConversationEnded } from '../../../temporal/signals/conversation.signals';
import { getWorkFlowClient } from '../../../temporal/clientServices/client';

import {  desc } from 'drizzle-orm';

export const getAllConversations = async () => {
  return await db.select().from(conversationsTable).orderBy(desc(conversationsTable.createdAt));
};

export const getConversationById = async (id: string) => {
  return await db.select({})
    .from(conversationsTable)
    .where(eq(conversationsTable.id, id))
    .limit(1)
    .then(results => results[0] || null);
};

export const createConversation = async (data: unknown) => {
  const parsed = createConversationSchema.safeParse(data);
  if (!parsed.success) throw parsed.error;
  const [created] = await db.insert(conversationsTable).values({ title: parsed.data.title }).returning();
  return created;
};

export const updateConversation = async (data: unknown) => {
  const parsed = updateConversationSchema.safeParse(data);
  if (!parsed.success) throw parsed.error;

  const [updated] = await db.update(conversationsTable)
    .set({ title: parsed.data.title })
    .where(eq(conversationsTable.id, parsed.data.id))
    .returning();

  return updated;
};

export const endConversationWorklfow =  async (workflowId: string) => {
    // Get the workflow client
        const workflowClient = await getWorkFlowClient();
        const handle = workflowClient.workflow.getHandle(workflowId);
        const status = await handle.describe();
        console.log(status.status); // Will show 'RUNNING', 'COMPLETED', etc.
        if (status.status.name === "RUNNING") {
           await handle.signal(setConversationEnded);
         
        }
  return true       
   }

export const deleteConversation = async (id: string) => {
  console.log(`Deleting the conversation id: ${id}`)

  const workflowEnded = await endConversationWorklfow(id)
  console.log(`The worflow has been ended : ${workflowEnded}`)

  if(workflowEnded){
     await db.delete(conversationsTable).where(eq(conversationsTable.id,id));
      return true
  }
  return false
};
