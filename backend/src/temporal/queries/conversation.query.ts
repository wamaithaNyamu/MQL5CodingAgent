import { defineQuery } from '@temporalio/workflow';

// Define the query
export const getConversationId = defineQuery<string>('getConversationId');

