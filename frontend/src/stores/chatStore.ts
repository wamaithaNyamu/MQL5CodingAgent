import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  response?: string;
  role: string;
  timestamp: string;
  next: string;
  args: Record<string, any>;
  tool: string;
  signedUrl?: boolean;
  confirmed?: boolean | null;
  rejected?: boolean | null;
  paymentstatus?: boolean | null;
  paymentfailed?: boolean | null;
}


interface ChatState {
  messagesBySession: Record<string, Message[]>;
  botNamesBySession: Record<string, string | undefined>;
  isChartToBeShown: boolean;

  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;
  clearMessages: (sessionId?: string) => void;
  setBotName: (sessionId: string, botName: string) => void;
  getBotName: (sessionId: string) => string | undefined;
  updateMessage: (sessionId: string, messageId: string, updatedFields: Partial<Message>) => void;

}


export const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    messagesBySession: {},
    botNamesBySession: {},
    isChartToBeShown: false,
    charts: {}, // Initialize the new charts state

    setMessages: (sessionId, messages) => {
      console.log(`✉️ Setting messages for session: ${sessionId}`, messages);
      return set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: messages,
        },
      }));
    },

    addMessage: (sessionId, message) => {
      console.log(`➕✉️ Adding message to session ${sessionId}:`, message);
      return set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: [
            ...(state.messagesBySession[sessionId] || []),
            message,
          ],
        },
      }));
    },

    clearMessages: (sessionId) => {
      console.log(`🧹 Clearing messages ${sessionId ? `for session: ${sessionId}` : 'for all sessions'}`);
      return set((state) => {
        if (sessionId) {
          const updatedMessages = { ...state.messagesBySession };
          delete updatedMessages[sessionId];

          const updatedBotNames = { ...state.botNamesBySession };
          delete updatedBotNames[sessionId];

          return {
            messagesBySession: updatedMessages,
            botNamesBySession: updatedBotNames,
          };
        }
        return { messagesBySession: {}, botNamesBySession: {} };
      });
    },

    setBotName: (sessionId, botName) => {
      console.log(`🤖 Setting bot name for session ${sessionId}: ${botName}`);
      return set((state) => ({
        botNamesBySession: {
          ...state.botNamesBySession,
          [sessionId]: botName,
        },
      }));
    },

    updateMessage: (sessionId, messageId, updatedFields) => {
      console.log(`📝✉️ Updating message ${messageId} in session ${sessionId} with:`, updatedFields);
      return set((state) => {
        const currentMessages = state.messagesBySession[sessionId];

        if (!currentMessages) {
          console.warn(`No messages found for session ID: ${sessionId}. Cannot update message.`);
          return state;
        }

        const updatedMessagesForSession = currentMessages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updatedFields } : msg
        );

        return {
          messagesBySession: {
            ...state.messagesBySession,
            [sessionId]: updatedMessagesForSession,
          },
        };
      });
    },

    setShowChartComponent: (status: boolean) => {
      console.log(`📊✅ Chart component visibility status updated: ${status}`);
      set({ isChartToBeShown: status });
    },

  
  }))
);