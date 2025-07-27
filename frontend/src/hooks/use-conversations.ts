import { useMutation } from '@tanstack/react-query';
import axiosClient from '@/lib/axios';

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useChatStore,Message } from '@/stores/chatStore'; // adjust path


export const useGetSignedURL = (botName:string) => {
  return useQuery({
    queryKey: [botName],
    queryFn: () =>
      axiosClient
        .post('/uploads',{
          botName:botName
        })
        .then((res) =>{
          console.log(`The response is ${JSON.stringify(res.data.data)}`)
           return res.data
        }),
         enabled: false,
  });
};


export const useGetAllConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      axiosClient
        .get('/conversation')
        .then((res) => res.data.data),
  });
};

// get all messages for a specific conversation

export const useGetMessagesForConversation = (conversationId: string) => {
const setMessages = useChatStore((state) => state.setMessages);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await axiosClient.get(`/message/conversation/${conversationId}`);
      console.log(`Setting messages from the api to zustand ${res.data.data}`)
      setMessages(conversationId,res.data.data); // sync to Zustand
      return res.data.data;
    },
    enabled: !!conversationId,
  });
};


// create a new conversation
export const useCreateConversation = () => {
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      axiosClient
        .post('/conversations', data)
        .then((res) => res.data.conversation),
  });
}

// send a message in a specific conversation
export const useSendMessage = (conversationId: string) => {
  return useMutation({
    mutationKey: ['sendMessage', conversationId],
    mutationFn: (data: { prompt: string }) =>
      axiosClient
        .post(`/message/signal/send-prompt/${conversationId}`, data)
        .then((res) => res.data.data),
  });
};
// mark conversation as favorite    
export const useMarkConversationAsFavorite = (conversationId: string) => {
  return useMutation({
    mutationFn: () =>
      axiosClient
        .post(`/conversations/${conversationId}/favorite`)
        .then((res) => res.data.data),
  });
}
export const useDeleteConversation = () => {
  return useMutation({
    mutationKey: ['deleteConversation'],
    mutationFn: (conversationId: string) =>
      axiosClient
        .delete(`/conversation/${conversationId}`)
        .then((res) => res.data),
  });
};
// Define the exact type of the response data that mutationFn returns
// and that onSuccess receives.
type WorkflowSignalResponse = {
  updatedMessage: Message; // The actual Message object
  confirmation: boolean;   // The confirmation status sent to backend
};

export const useSendWorkflowConfirmation = (conversationId: string) => {
  const updateMessageInStore = useChatStore((state) => state.updateMessage);

  const mutation = useMutation<
    WorkflowSignalResponse, // ✅ Correctly typed response from mutationFn
    AxiosError,
    { confirmation: boolean; messageID: string }
  >({
    mutationKey: ['sendConfirmation', conversationId],
    mutationFn: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await axiosClient.post(
        `/message/signal/confirm/${conversationId}`,
        data
      );
      // ✅ Ensure the backend actually returns this specific structure.
      // If res.data is already {updatedMessage: ..., confirmation: ...}, then it's just res.data
      // If res.data.data is {updatedMessage: ..., confirmation: ...}, then it's res.data.data
      // Based on your log, it seems res.data.data is the correct path.
      return res.data.data as WorkflowSignalResponse;
    },
    onSuccess: (response: WorkflowSignalResponse, variables) => {
      // ✅ Now 'response' is correctly typed as WorkflowSignalResponse
      //    And 'response.updatedMessage' is the actual Message object
      const actualMessageFromBackend = response.updatedMessage;

      console.log("Workflow signal successful. Backend response object:", response);
      console.log("Actual Message data from backend:", actualMessageFromBackend);
      console.log("Backend provided 'confirmed':", actualMessageFromBackend.confirmed, "Backend provided 'rejected':", actualMessageFromBackend.rejected);

      // ✅ THIS IS THE CRITICAL CORRECTION:
      // Pass the actual Message object (actualMessageFromBackend) directly to updateMessageInStore.
      // Its top-level properties (including confirmed, rejected) will now merge correctly.
      updateMessageInStore(conversationId, variables.messageID, actualMessageFromBackend);

      console.log("updateMessageInStore called for messageID:", variables.messageID, "with data:", actualMessageFromBackend);
    },
    onError: (error, variables) => {
      console.error("Workflow signal failed for messageID:", variables.messageID, "Error:", error);
      updateMessageInStore(conversationId, variables.messageID, {
        confirmed: false,
        rejected: true
      });
    },
  });

  return {
    sendConfirmation: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
};

interface StartConversationInput {
  initialPrompt: string;
}

interface StartConversationResponse {
  message: string;
  data: {
    workflowId: string;
    runId: string;
  };
}

export const useStartConversation = () => {
  const mutation = useMutation<
    StartConversationResponse,     // response data
    AxiosError,                    // error type
    StartConversationInput         // input type
  >({
    mutationKey: ['startConversation'],
    mutationFn: async ({ initialPrompt }) => {
      const res = await axiosClient.post('/conversation-workflow/workflow/start-conversation', { initialPrompt });
      return res.data.data;
    },
  });

  return {
    startConversation: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};