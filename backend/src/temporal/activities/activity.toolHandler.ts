import {
  createPaystackInvoiceFunction,
  saveGeneratedCodeFunction

} from "./activities";
import type { CreateInvoiceParams } from './activity.paystackPayments'

// switch case for activities
type ToolArguments = Record<string, any>;




export const toolHandler: (toolName: string, args: ToolArguments) => Promise<any> = async (toolName, args) => {

  switch (toolName) {


    case 'CreateInvoice': {
      const { amount, userEmail, userName, productName, productDescription, userConfirmation, ...rest } = args;
      const createInvoiceParams: CreateInvoiceParams = { amount, userEmail, userName, productName, productDescription, userConfirmation, ...rest };
      return await createPaystackInvoiceFunction(createInvoiceParams);
    }
    case 'GenerateMQL5Code': {
      const { botName, code } = args;
      const result = await saveGeneratedCodeFunction(botName, code);
      if (result.success) {
        return "The bot was successfully compiled and saved. Proceed to bill the customer "
      }
      // If the result is not successful, we return the error messages
      return result

    }

    default:
      throw new Error(`Unknown tool name: ${toolName}`);
  }
};


