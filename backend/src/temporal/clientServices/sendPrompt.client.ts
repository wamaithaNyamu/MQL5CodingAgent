import { getWorkFlowClient } from './client';
import { sendUserInput } from '../signals/conversation.signals';

export async function sendPromptToLLM(workflowId: string,content:string): Promise<void> {
  const client = await getWorkFlowClient();
  const handle = client.workflow.getHandle(workflowId);
  await handle.signal(sendUserInput, content);
  console.log(`Signal sent to workflow ${workflowId} with content: ${content}`);
  return;


}