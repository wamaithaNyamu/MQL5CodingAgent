import type { AgentGoal } from "./tools.types";

export type role = 'user' | 'assistant';

export interface Message{
    id:string;
    conversationId:string;
        role: role;
        content: string;
        timestamp: Date;
    }

    
export interface Conversation {
    conversationID: string;
    conversationTitle: string;
}   


export interface ConversationHistory {
 
    messages: Message[];
}

export interface ValidationInput{
    prompt: string;
    conversationHistory:ConversationHistory;
    agentGoal: AgentGoal
}

interface IValidationResult {
  validationResult: boolean;
  validationFailedReason: Record<string, string>;
}

export class ValidationResult implements IValidationResult {
  validationResult: boolean;
  validationFailedReason: Record<string, string>;

  constructor(
    validationResult: boolean,
    validationFailedReason?: Record<string, string>
  ) {
    this.validationResult = validationResult;
    this.validationFailedReason = validationFailedReason ?? {};
  }
}


export interface ToolPromptInput{
     prompt: string;
     contextInstructions: string;
}
export type NextStep = "confirm" | "question" | "done" | "user_confirmed_tool_run"|"tool-error";

export interface ToolData {
  next?: NextStep;
  tool?: string;
  args?: Record<string, any>;
  response?: string;
  force_confirm?: boolean;
   signedUrl?: string;
}
