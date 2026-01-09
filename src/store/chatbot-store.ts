import { create } from 'zustand';

interface ChatContext {
  route?: string;
  symbol?: string;
  price?: number;
}

interface ChatbotState {
  isOpen: boolean;
  initialMessage: string;
  context: ChatContext;
  openChatbot: (initialMessage?: string) => void;
  closeChatbot: () => void;
  setContext: (context: ChatContext) => void;
}

const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  initialMessage: 'Hi! How can I assist you today?',
  context: {},
  openChatbot: (initialMessage) => set({
    isOpen: true,
    initialMessage: initialMessage || 'Hi! How can I assist you today?'
  }),
  closeChatbot: () => set({ isOpen: false }),
  setContext: (context) => set({ context }),
}));

export default useChatbotStore;
