import { getWorkFlowClient } from './client';
import { confirmToolRun } from '../signals/conversation.signals';
// Define the query

export async function confirmToolRunSignal(workflowId: string,content:string): Promise<void> {
    console.log(`Sending a confirm signal ...`)
    const client = await getWorkFlowClient();

  const handle = client.workflow.getHandle(workflowId);
  await handle.signal(confirmToolRun, true);
  console.log(`Signal sent to workflow ${workflowId} with confirm set to true: ${content}`);
  return;


}