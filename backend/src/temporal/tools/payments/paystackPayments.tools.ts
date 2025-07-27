import type { ToolDefinition } from '../../types/tools.types';

export const createPaystackInvoice: ToolDefinition = {
    name: "CreateInvoice",
    description: "Generate an invoice for the trading strategy described for the total inferred by the conversation history so far. Returns URL to invoice.",
    arguments: [
        {
            name: 'amount',
            type: 'float',
            description: "The total cost to be invoiced. Infer this from the conversation history.",
            question: "To generate the invoice, I need to confirm the total amount. Can you confirm the total cost for the strategy?" // Or "What is the total amount for the invoice?" if not directly inferable.
        },
        {
            name: 'userEmail',
            type: 'string',
            description: "The email of the user that wants to pay.",
            question: "What is your email address so I can send the invoice?"
        },
        {
            name: 'userName',
            type: 'string',
            description: "The name of the user that wants to pay. Infer this from the conversation history.",
            question: "What is your name for the invoice?"
        },
        {
            name: 'productName',
            type: 'string',
            description: "The name the user wants to give to the trading bot. Infer this from the conversation history.",
            question: "What is the name of the trading bot for the invoice?"
        },
        {
            name: 'productDescription',
            type: 'string',
            description: "The detailed workings the user gave of how the trading strategy works. Infer this from the conversation history.",
            question: "Could you provide a brief description of the trading strategy for the invoice details?"
        }
    ]
};