import { proxyActivities, condition, setHandler } from '@temporalio/workflow';
import { setConversationEnded, sendUserInput, confirmToolRun } from '../signals/conversation.signals';
import { getConversationId } from '../queries/conversation.query';
// Only import the activity types
import type * as activities from '../activities/activities';
import type { RunWorkflowArgs } from '../shared/interfaces.shared';
import type { ToolData, ToolPromptInput } from '../types/conversation.types';

const {
  storeMessageInPostgres,
  agentValidationPrompt,
  getConversationHistory,
  toolHandler,
  handleMissingArgs,
  readyForToolExecution,
  getSystemPromptCoding,
  agentToolPlannerUsingCaching
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minute',
});

export async function conversationWorkflow(args: RunWorkflowArgs): Promise<string> {
  console.log(`🧠 🧠 The conversation workflow has started with args: ${JSON.stringify(args)}`);
  let conversationEnded = false;
  let conversationId = args.conversationId;
  const messageQueue: string[] = [];
  // initialise tool data
  let toolData: ToolData | null | any = null;
  // initialise the current tool
  let currentTool: string | null = null
  // initialise waitingForConfirm
  let waitingForConfirm = true
  // confirmed (will be a signal)
  let confirmed: boolean | null = null;
  // let tool result
  let toolResults: null | any = null

 
 // let signedUrl
  let signedUrl: string | null = null;

  // 🟨 Signal handlers
  setHandler(setConversationEnded, () => {
    conversationEnded = true;
  });


 
  setHandler(sendUserInput, (msg: unknown) => {
    const safeMsg = typeof msg === 'string' ? msg : JSON.stringify(msg ?? '');
    console.log(`📩 safeMsg Signal received: ${safeMsg}`);
    messageQueue.push(safeMsg);
  });



  setHandler(confirmToolRun, (confirmation: boolean) => {
    console.log(`📩 Confirm Signal received: ${confirmation}`);
    confirmed = confirmation
  });



  // 🟦 Query handler
  setHandler(getConversationId, () => conversationId);


  // 📝 Push initial message ONCE
  if (args.initialPrompt) {
    messageQueue.push(args.initialPrompt);
    console.log(`📝 Initial prompt added to queue: ${args.initialPrompt}`);
  }

  // 🌀 Main conversation loop
  while (!conversationEnded) {
    // 🧠 Wait for at least 1 message
    await condition(() => messageQueue.length > 0 || conversationEnded || confirmed !== null);
    // handle chat end

    if (conversationEnded) break;
    // tool execution
    if (confirmed === true) {
      console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅ Tool confirmation received from the user.');
      if (await readyForToolExecution(confirmed ?? false, waitingForConfirm, currentTool)) {
        const toolDataCopy = { ...(toolData ?? {}) } as ToolData;
        toolDataCopy.next = "user_confirmed_tool_run";
        console.log(`The tool has been confirmed and now running ${currentTool} `)
        // execute the tool using handler
        console.log(`✅ The tool has been confirmed and now running ${currentTool}`);
        if (currentTool !== null) {
          // 🔽 Wrap the tool execution in a try...catch block
          try {
            // 1. Execute the tool and get the results
            toolResults = await toolHandler(currentTool, toolData.args);
            console.log(`🛠️ Tool [${currentTool}] finished with results:`, JSON.stringify(toolResults, null, 2));

            if (toolResults) {
              // check if tool is generated code
              if (toolResults.signedUrl) {
                // Store the signed URL in the toolData
                signedUrl = toolResults.signedUrl;
                console.log(`🛠️ Tool [${currentTool}] generated a signed URL: ${toolResults.signedUrl}`);
              }

              // 2. Formulate a prompt to summarize the results
              const summarizationPrompt = `A tool has been executed. Based on the following results, please formulate a clear and helpful response for the user. The results are: ${JSON.stringify(toolResults)}`;
              const hist = await getConversationHistory(conversationId);
              const systemPrompt = await getSystemPromptCoding( hist, null);

              const responsePrompt: ToolPromptInput = {
                prompt: summarizationPrompt,
                contextInstructions: systemPrompt,
              };

              // 3. Call the LLM to generate the final response
                const finalResponseData = await agentToolPlannerUsingCaching(responsePrompt);
              // const finalResponseData = await agentToolPlanner(responsePrompt);
              const finalMessage = finalResponseData.response;

              // 4. Store the final assistant message
              if (finalMessage) {
               await storeMessageInPostgres({
                  conversationId,
                  role: 'assistant',
                  content: finalMessage,
                  signedUrl: !!toolResults.endConversation, // Store the signed URL if it exists
                });
              }

              // if the tool was create invoice we need to end conversation:
              if (toolResults.endConversation) {
                conversationEnded = true
              }
            }
          } catch (error: any) {
            // 🔽 This block executes if the toolHandler fails
            console.error(`💥 Tool execution failed:`, error);

            // Formulate an error message for the user
            const userErrorMessage = `I encountered an error while trying to run the tool: "${error.message}". Please check your request for any issues, or try rephrasing your instructions.`;

            // Send the error message to the user
            await storeMessageInPostgres({
              conversationId,
              role: 'assistant',
              content: userErrorMessage,
            });
          }
        } else {
          console.error('Confirmation received, but currentTool is null.');
        }

      }
      // Reset state after handling the confirmation
      confirmed = null;
      currentTool = null;
      toolData = null;
      continue; // Loop to wait for the next user inpu
    }

    // if confirmed is true and the current tool is gatherChartData lets use that to prepopulate the Generate code
    // 🔽 4. Handle a REJECTED tool run
    if (confirmed === false) {
      console.log('❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ ❌ Tool confirmation was rejected by the user.');

      const rejectionMessage = "Ask the user if there is something they need to change because they rejected the tool execution";
      const hist = await getConversationHistory(conversationId);
      const systemPrompt = await getSystemPromptCoding( hist, null);
   
      const responsePrompt: ToolPromptInput = {
        prompt: rejectionMessage,
        contextInstructions: systemPrompt

      };
      // 3. Call the LLM to generate the final response

      // const finalResponseData = await agentToolPlanner(responsePrompt);
      const finalResponseData = await agentToolPlannerUsingCaching(responsePrompt);
      const finalMessage = finalResponseData.response;
      // 4. Store the final assistant message
      if (finalMessage) {
        await storeMessageInPostgres({
          conversationId,
          role: 'assistant',
          content: finalMessage,
        });
      }

      console.log(`🤖 Assistant response after rejection: ${rejectionMessage}`);
      // Reset state after handling the rejection
      confirmed = null;
      currentTool = null;
      toolData = null;
      continue; // Loop to wait for the user's new instructions
    }

    const userMessage = messageQueue.shift()!;
    // 🟩 Store user message
    await storeMessageInPostgres({
      conversationId,
      role: 'user',
      content: userMessage
    });
    // ============== validate the prompt ==============
    // get conversation history
    const hist = await getConversationHistory(conversationId)
    // get validation
    const validationResult = await agentValidationPrompt(userMessage, hist)
    // if validation failed provide the freedback tot he user
    if (!validationResult.validationResult) {
      // 🟦 Store assistant message
      await storeMessageInPostgres({
        conversationId,
        role: 'assistant',
        content: validationResult.validationFailedReason
      });
      // console.log(`🤖 Assistant response to invalid response args: ${validationResult.validationFailedReason}`);
      continue
    }


    // if validation passed
    // get system prompt

    const systemPrompt = await getSystemPromptCoding(hist, JSON.stringify(toolData))


    const fullPrompt: ToolPromptInput = {
      prompt: userMessage,
      contextInstructions: systemPrompt,

    }

    toolData = await agentToolPlannerUsingCaching(fullPrompt)
    let nextStep = toolData["next"]
    currentTool = toolData["tool"]
    let args = toolData["args"] || {}
    if (nextStep === "confirm" && currentTool) {
      console.log(`🤖🤖🤖🤖🤖🤖🤖🤖🤖🤖 confirm is true and current tool`);
      // console.log(`🤖 Assistant is asking for confirmation to run the tool: ${currentTool}`);
      // if args are missing
      const prompt: string | false = await handleMissingArgs(currentTool ?? '', args, toolData)
      if (!prompt) {
        // if no missing args, the assistant is ready to ask for confirmation to run the tool
        const confirmationMessage = typeof toolData.response === 'string' ? toolData.response : `Agent is ready to run the tool: **${currentTool}** with the following arguments: ${JSON.stringify(args, null, 2)}. Please confirm to proceed.`;
        console.log(`🤖 Assistant is asking for confirmation to run the tool: ${currentTool} with args: ${JSON.stringify(args)}`);

         await storeMessageInPostgres({
          conversationId,
          role: 'assistant',
          content: confirmationMessage, // Store the message indicating confirmation is needed
          next: "confirm", // Explicitly set to "confirm"
          tool: currentTool ?? undefined,
          args: args
        });

        continue
      }
      // we get a response from llm to ask user for missing args
      const safeResponse = typeof prompt === 'string'
        ? prompt
        : JSON.stringify(prompt ?? '');
      await storeMessageInPostgres({
        conversationId,
        role: 'assistant',
        content: safeResponse,
        next: nextStep,
        tool: currentTool ?? undefined,
        args: args
      });
      continue
    }

    // else if the next step is to be done with the conversation such as if the user requests it via asking to "end conversation"

    if (nextStep === "done") {
      break
    }

    // agent is still gathering info
    if (nextStep === "question") {
      let safeResponse = '';

      // 1. Try to get content from 'response' field first (often used for tool outputs)
      if (typeof toolData.response === 'string' && toolData.response.trim() !== '') {
        safeResponse = toolData.response;
      } else if (typeof toolData.response === 'object' && toolData.response !== null && typeof toolData.response.response === 'string' && toolData.response.response.trim() !== '') {
        // This handles cases where 'response' itself might be an object containing a 'response' key
        safeResponse = toolData.response.response;
      }
      // 2. Fallback to 'content' field (for direct AI messages)
      else if (typeof toolData.content === 'string' && toolData.content.trim() !== '') {
        safeResponse = toolData.content;
      }
      // 3. Final fallback: If neither is a suitable string, default to empty string or a generic message
      else {
        console.warn("⚠️ No valid string 'response' or 'content' found in message:", toolData);
        safeResponse = ''; // Or a default message like 'AI response received but content was empty.'
      }


      console.log(`🤖 Assistant response to still gathering info: ${safeResponse}`);
      await storeMessageInPostgres({
        conversationId,
        role: 'assistant',
        content: safeResponse, // Store the safely determined content
        next: nextStep,
        tool: currentTool ?? undefined,
        args: args
      });
    }
    // confrimation from user needed
    if (nextStep === "confirm") {
      const safeResponse = typeof toolData["response"] === 'string'
        ? toolData["response"]
        : JSON.stringify(toolData["response"] ?? '');
      console.log(`🤖 Assistant response to tool data confirm: ${safeResponse}`);

     await storeMessageInPostgres({
        conversationId,
        role: 'assistant',
        content: safeResponse,
        next: nextStep,
        tool: currentTool ?? undefined,
        args: args
      });
    }
  }

  return 'Conversation ended.';
}



