// InvestWise - A modern stock trading and investment education platform for young investors
import { create } from 'zustand';

interface ChatContext {
  route?: string;
  symbol?: string;
  price?: number;
}

interface ChatbotState {
  isOpen: boolean;
  initialMessage: string;
  pendingQuery: string | null;
  context: ChatContext;
  openChatbot: (initialMessage?: string, pendingQuery?: string) => void;
  closeChatbot: () => void;
  setContext: (context: ChatContext) => void;
}

const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  initialMessage: 'Hi! How can I assist you today?',
  pendingQuery: null,
  context: {},
  openChatbot: (initialMessage, pendingQuery) => set({
    isOpen: true,
    initialMessage: initialMessage || 'Hi! How can I assist you today?',
    pendingQuery: pendingQuery || null
  }),
  closeChatbot: () => set({ isOpen: false, pendingQuery: null }),
  setContext: (context) => set({ context }),
}));

export default useChatbotStore;
