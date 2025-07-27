import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axiosClient from '@/lib/axios'; // Adjust path
import { useChatStore, Message } from '@/stores/chatStore'; // Adjust path

type PaymentStatusUpdateData = {
  messageID: string;
  paymentstatus: boolean;
  paymentfailed: boolean;
  paystackReference?: {}; // Optional reference from Paystack
};

export const useSendPaymentStatus = (conversationId: string) => {
  const updateMessageInStore = useChatStore((state) => state.updateMessage);

  const mutation = useMutation<
    Message, // Backend should return the updated Message object
    AxiosError,
    PaymentStatusUpdateData
  >({
    mutationKey: ['sendPaymentStatus', conversationId],
    mutationFn: async (data) => {
      // ✅ This is a conceptual endpoint. Adjust to your actual backend endpoint
      // for updating message payment status.
      const res = await axiosClient.post(
        `/message/payment/${data.messageID}`,
        {
          payment_status: data.paymentstatus,
          payment_failed: data.paymentfailed,
          paystack_reference: data.paystackReference,
        }
      );
      // Assuming res.data.data is the updated Message object from the backend
      return res.data.data as Message;
    },
    onSuccess: (updatedMessage: Message, variables) => {
      console.log("Payment status update successful. Updating message in store:", updatedMessage);
      // Backend should now provide the accurate paymentstatus and paymentfailed
      updateMessageInStore(conversationId, updatedMessage.id, updatedMessage);
    },
    onError: (error, variables) => {
      console.error("Failed to update payment status on backend:", error);
      // Optionally update frontend state to reflect local failure, if needed
      updateMessageInStore(conversationId, variables.messageID, {
        paymentstatus: false,
        paymentfailed: true,
      });
    },
  });

  return {
    sendPaymentStatus: mutation.mutate,
    isUpdatingPaymentStatus: mutation.isPending,
    paymentStatusError: mutation.error,
  };
};