import { BUILD_A_TRADING_BOT } from '../shared/variables.shared';
import { conversationWorkflow } from '../workflows/startConversation.workflow';
import type { RunWorkflowArgs } from '../shared/interfaces.shared';
import { getWorkFlowClient } from './client';

import { createConversation } from '../../server/AIAgent/service/conversation.service';

export async function  runStartConversationWorkFlow(args:RunWorkflowArgs) {
  try {
     let conversationId = args.conversationId;
    // Health check: Ensure the server is available
    const client = await getWorkFlowClient();
    const initialPrompt = args.initialPrompt;
// check if conversationId is provided, if not create a new conversation
    if(!args.conversationId) {

    const conversation = await createConversation({
        title:initialPrompt,
     
    })
    conversationId = conversation.id;
    console.log(`📝 Created new conversation with ID: ${conversationId}`);
  }
    // add conversationId to args
   const argsWithConversationId: RunWorkflowArgs = {
      ...args,
      conversationId:conversationId
    };

    console.log(`📝 Initial prompt: ${initialPrompt}`);
    console.log(`📝 Starting conversation with ID: ${conversationId} and all args are ${JSON.stringify(argsWithConversationId)}`);
    // Start the workflow
    const handle = await client.workflow.start(conversationWorkflow, {
      taskQueue: BUILD_A_TRADING_BOT,
      args: [argsWithConversationId],
      workflowId: conversationId
    });

    console.log(`🚀 Started workflow: ${handle.workflowId}`);
    return    {
    workflowId: handle.workflowId,
    runId: handle.firstExecutionRunId,
  };

  } catch (err) {
    console.error('❌ Failed to connect to Temporal server:', err);
    process.exit(1);
  }
}