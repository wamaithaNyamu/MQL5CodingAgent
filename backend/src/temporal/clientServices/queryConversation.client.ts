import { getWorkFlowClient } from './client';

// Define the query

export async function queryConversationId(workflowId: string): Promise<string> {
  const client = await getWorkFlowClient();

  const handle = client.workflow.getHandle(workflowId);
  const conversationId = await handle.query('getConversationId');

  return conversationId as string;

}