import { create } from 'zustand';

interface ChatbotState {
  isOpen: boolean;
  initialMessage: string;
  openChatbot: (initialMessage?: string) => void;
  closeChatbot: () => void;
}

const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  initialMessage: 'Hi! How can I assist you today?',
  openChatbot: (initialMessage) => set({ 
    isOpen: true, 
    initialMessage: initialMessage || 'Hi! How can I assist you today?' 
  }),
  closeChatbot: () => set({ isOpen: false }),
}));

export default useChatbotStore;
