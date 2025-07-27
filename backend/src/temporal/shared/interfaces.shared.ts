import type { Response,Request } from "express";

export interface RunWorkflowArgs {
  conversationId:string;
  initialPrompt: string;
  request?: Request;
  responseStream?: Response;
  
}

