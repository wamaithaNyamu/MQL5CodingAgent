
export interface ToolArguments {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean' | 'float' |'object' | 'array' | 'date' | 'function' | 'indicator';
  description: string;
  properties?: Record<string, {}>; // Optional properties for additional metadata
  question?: string; // Optional question to ask the user

  enum?: { value: string; description: string }[];
}



export interface ToolDefinition {
  name: string;
  
  description: string;
  arguments: ToolArguments[];
  returns?: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    example?: string | number | boolean | object;
  };


}



export interface CodeAgentGoal {
  id: string;
  agentName: string;
  tools: ToolDefinition[] ;
  description?: string; // optional with default value
  exampleConversationHistory?: string;
}
