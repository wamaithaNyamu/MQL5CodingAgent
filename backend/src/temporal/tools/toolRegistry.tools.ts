
import { createPaystackInvoice } from "./payments/paystackPayments.tools";
import { GenerateMQL5Code } from "./mql5CodeGeneration/tool.code"
export const toolRegistry = {
    createPaystackInvoice,
    GenerateMQL5Code
};

