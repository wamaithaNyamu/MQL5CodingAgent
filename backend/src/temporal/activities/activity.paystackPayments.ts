export type CreateInvoiceParams = {
  amount: number;
  userEmail: string;
  userName: string;
  productName: string;
  productDescription: string;
  userConfirmation: string;
};

type CreateInvoiceResponse = {
  invoiceUrl: string;
};
export const createPaystackInvoiceFunction = async (
  params: CreateInvoiceParams
): Promise<CreateInvoiceResponse | any> => {
  const {
    amount,
    userEmail,
    userName,
    productName,
    productDescription

  } = params;

  // Return dummy invoice URL
  // In a real implementation, you would call the Paystack API to confirm payment and generate an invoice URL
  return {
    endConversation: true,
    message: "The payment has been validated. Inform the user that they can download the trading bot by clicking the download button below."

  };
};
