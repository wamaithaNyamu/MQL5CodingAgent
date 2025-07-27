import { createMessage, getAllMessagesByConversationById } from '../../server/AIAgent/service/message.service';
import type {  ToolPromptInput ,Message} from '../types/conversation.types';
import {parseJsonResponse,sanitizeJsonResponse} from '../../server/utils/utils.cleanResponse'
import { systemPrompt } from "../../temporal/prompts/systemPrompt.prompts";
import {codeTradingBotMQL5Goal} from "../../temporal/goals/codeTradingBot.goals"

import { geminiAPIKey,geminiCache } from '../../config/envVariables.config';
import {
  GoogleGenAI
} from "@google/genai";
import { errorResponse } from '../../server/utils/utils.response';

const ai = new GoogleGenAI({ apiKey: geminiAPIKey});


export async function generateGeminiLLMResponseUsingCache(
  prompt: string | string[],
  cacheName: string =geminiCache
): Promise<string> {
  try {
    const modelName = "gemini-2.0-flash-001";
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { 
        cachedContent: cacheName,
        maxOutputTokens: 2450 
      },
    });
    console.log(`✅ This response used the cache!`);
    return response.text ?? '';
  } catch (e: unknown) {
    console.error(`❌ The error faced during prompt gen is ${e}`);

    // Check for the specific cache-related error message
    if (e instanceof Error && e.message.includes("CachedContent not found (or permission denied)")) {
      console.log("🔄 Specific cache error detected. Retrying without cache.");
            const systemprompt = await systemPrompt(codeTradingBotMQL5Goal);

      const modelName = "gemini-2.0-flash-001";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: `
          ${systemprompt}
          Query:
          ${prompt}
        `,
         config: { 
               maxOutputTokens: 2450 
      }
      });
      return response.text ?? '';
    }
    // If the error is something else, throw the general error response
    throw errorResponse("We had an issue generating this response");
  }
}



// agent tool planner
export async function agentToolPlannerUsingCaching(input: ToolPromptInput){
    // need to figure out what the input is
      const messages = [
            {
                "role": "system",
                "content": input.contextInstructions
                + ". The current date is "
                + new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
            },
            {
                "role": "user",
                "content": input.prompt,
            },
        ]
        // use for gemini
        const promptStrings = messages.map(msg => `${msg.role}: ${msg.content}`);
        let aiResponse = await generateGeminiLLMResponseUsingCache(promptStrings)
    
        aiResponse = sanitizeJsonResponse(aiResponse)
       return parseJsonResponse(aiResponse)
       
}



export async function agentValidationPrompt(
  prompt: string,
  conversationHistory: Message[],
) {
  // Convert conversation history to string, focusing on relevant parts
  const historyStr = JSON.stringify(conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  })), null, 2);

  const contextInstructions = `
      The conversation history to date is:
      ${historyStr}`;
  // Create validation prompt for the LLM
  const validationPrompt = `The user's prompt is: "${prompt}"
      Please validate if this prompt makes sense given the agent goal,tools and conversation history.
      If the prompt makes sense toward the goal then validationResult should be true.
      If the prompt is wildly nonsensical or makes no sense toward the goal and current conversation history then validationResult should be false.
      If the response is low content such as "yes" or "that's right" then the user is probably responding to a previous prompt.  
      Therefore examine it in the context of the conversation history to determine if it makes sense and return true if it makes sense.
      Return ONLY a JSON object with the following structure:
      {
        "validationResult": true/false,
        "validationFailedReason": {
          "next": "question",
          "response": "[your reason here and a response to get the user back on track with the agent goal]"
        } or {}
      }`;

  // Build prompt input for LLM
  const promptInput: ToolPromptInput = {
    prompt: validationPrompt,
    contextInstructions: contextInstructions,
  };

  const aiResponse = await agentToolPlannerUsingCaching(promptInput)
  console.log('------------------------------------------------');
  console.log('AI Validation Response:', aiResponse);

  let validationFailedReason = aiResponse.validationFailedReason || {};

  // ✅ NEW LOGIC: Explicitly check if 'code' arg is null and adjust 'next'
  if (validationFailedReason && 'code' in validationFailedReason && validationFailedReason.code === null) {
      console.log("Validation failed: 'code' argument is null. Setting 'next' to 'question'.");
      // If code is null, force 'next' to 'question' 
      validationFailedReason = {
          ...validationFailedReason, // Keep other properties if any
          next: "question",
          response: validationFailedReason.response 
     
        };
  }
  return {
    validationResult: aiResponse.validationResult,
    validationFailedReason: aiResponse.validationFailedReason || {}, // Ensure it's always an object
  };
}

export async function storeMessageInPostgres(msg: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  next?: string;
  tool?: string;
  args?: Record<string, any>;
  signedUrl?: boolean | null; // Optional signed URL for the uploaded bot
}): Promise<void> {
  await createMessage(msg);
  console.log('Stored message:',msg);
  
}


export async function getConversationHistory(conversationId: string){
  return  await getAllMessagesByConversationById(conversationId)

}


export async function readyForToolExecution(
  confirmed: boolean,
  waitingForConfirm: boolean,
  currentTool: string | null
): Promise<boolean> {
  return confirmed && waitingForConfirm && !!currentTool;
}


function generateMissingArgsPrompt(
  currentTool: string,
  toolData: Record<string, any>,
  missingArgs: string[]
): string {
  return `### INSTRUCTIONS set next='question', combine this response response='${toolData?.response}' and following missing arguments for tool ${currentTool}: ${JSON.stringify(missingArgs)}. You can use the 'question' field to get determine the expected response from the user. Only provide a valid JSON response without any comments or metadata.`;
}


export async function handleMissingArgs(
  currentTool: string,
  args: Record<string, any>,
  toolData: Record<string, any>, // or use your `ToolData` type if preferred
): Promise<false | string> {

  const missingArgs = Object.entries(args)
    .filter(([_, value]) => value === null || value === undefined)
    .map(([key]) => key);


  if (missingArgs.length > 0) {
    const prompt = await generateMissingArgsPrompt(currentTool, toolData, missingArgs);
    console.info(`Missing arguments for tool: ${currentTool}: ${missingArgs.join(' ')}`);    
    return await generateGeminiLLMResponseUsingCache(prompt);
  }

  return false;
}
