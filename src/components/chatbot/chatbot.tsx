// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Bot, Send, User, MessageCircleQuestion, Paperclip, Mic, MicOff, Volume2 } from "lucide-react";
import { useLiveVoice } from "@/hooks/use-live-voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { handleInvestmentQuery } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import useChatbotStore from "@/store/chatbot-store";
import { useThemeStore } from "@/store/theme-store";
import { useProModeStore } from "@/store/pro-mode-store";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "ai" | "loading";
  content: string;
}

const FormattedMessage = ({ content }: { content: string }) => {
  if (!content) return null;
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return (
    <p className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </p>
  );
};

export default function Chatbot({ isMobileCompact = false }: { isMobileCompact?: boolean }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const { isOpen, openChatbot, closeChatbot, initialMessage, pendingQuery } = useChatbotStore();
  const { isClearMode, theme } = useThemeStore();
  const { isProMode } = useProModeStore();
  const pathname = usePathname();
  const isLightClear = isClearMode && theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGlow, setShowGlow] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedQueryRef = useRef<string | null>(null);

  // Voice mode hook
  const {
    isConnected: isVoiceConnected,
    isListening,
    isSpeaking,
    connect: connectVoice,
    disconnect: disconnectVoice,
    toggleListening,
    sendText,
  } = useLiveVoice({
    systemInstruction: `You are a friendly and helpful AI assistant named InvestWise Bot. 
Your primary goal is to explain complex investment terms to beginners in a simple, clear, and encouraging way.
Avoid jargon where possible, or explain it immediately. Use analogies if they help clarify a concept.

User Context:
- Current Page: ${pathname}${useChatbotStore.getState().context.symbol
        ? `\n- Active Stock: ${useChatbotStore.getState().context.symbol}`
        : ''
      }${useChatbotStore.getState().context.price
        ? `\n- Current Price: $${useChatbotStore.getState().context.price}`
        : ''
      }`,
    onTranscript: (text, isUser) => {
      setMessages((prev) => [...prev, { role: isUser ? 'user' : 'ai', content: text }]);
    },
    onError: (error) => {
      console.error('Voice mode error:', error);
      toast({ title: 'Voice Error', description: error, variant: 'destructive' });
    },
  });

  // Toggle voice mode
  const handleVoiceModeToggle = async () => {
    if (isVoiceMode) {
      disconnectVoice();
      setIsVoiceMode(false);
    } else {
      await connectVoice();
      setIsVoiceMode(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Check for the glow effect flag on component mount
    if (sessionStorage.getItem('showGlowEffect') === 'true') {
      setShowGlow(true);

      // Turn off the glow after a few seconds
      const timer = setTimeout(() => {
        setShowGlow(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const submitQuery = async (query: string, fileDataUri?: string) => {
    if (!query.trim() && !fileDataUri) return;

    // Handle voice mode text input
    if (isVoiceMode && isVoiceConnected && !fileDataUri) {
      setMessages(prev => [...prev, { role: "user", content: query }]);
      sendText(query);
      setInput("");

      // Clear pending query
      if (pendingQuery) {
        useChatbotStore.getState().openChatbot(initialMessage, undefined);
      }
      return;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: query },
      { role: "loading", content: "" },
    ];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Clear pending query if it was auto-submitted
    if (pendingQuery) {
      useChatbotStore.getState().openChatbot(initialMessage, undefined); // clear pending
    }

    try {
      const result = await handleInvestmentQuery(query, fileDataUri, useChatbotStore.getState().context);
      if (result.success) {
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.role !== "loading");
          return [...newMessages, { role: "ai", content: result.response }];
        });
      } else {
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.role !== "loading");
          return [
            ...newMessages,
            { role: "ai", content: result.error || "Something went wrong." },
          ];
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.role !== "loading"),
        { role: "ai", content: "Failed to connect to the server." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let fileDataUri: string | undefined;

    if (file) {
      fileDataUri = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setFile(null); // Clear file after processing
    }

    await submitQuery(input, fileDataUri);
  };

  // Auto-submit effect
  useEffect(() => {
    if (isOpen && pendingQuery && pendingQuery !== lastProcessedQueryRef.current) {
      lastProcessedQueryRef.current = pendingQuery;
      submitQuery(pendingQuery);
    } else if (!pendingQuery) {
      lastProcessedQueryRef.current = null;
    }
  }, [isOpen, pendingQuery]);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={cn(
            "z-40",
            isMobileCompact ? "fixed left-0 right-0 mx-auto bottom-14 w-[60%] max-w-[220px]" : "relative w-12 h-12 flex items-center justify-center"
          )}
        >
          <div className="relative w-full group">
            {isClearMode && (
              <div className="frosted-distortion absolute inset-0 rounded-full z-0" />
            )}
            <Button
              variant="outline"
              className={cn(
                "relative z-10 rounded-full shadow-2xl shadow-black/20 overflow-hidden",
                isMobileCompact ? "w-full justify-between items-center p-2 h-auto" : "h-12 w-12 p-0 flex items-center justify-center",
                isClearMode
                  ? isLightClear
                    ? "bg-card/60 text-foreground ring-1 ring-black/10" // Light Clear
                    : "bg-white/10 text-white ring-1 ring-white/60" // Dark Clear
                  : "bg-card text-card-foreground ring-1 ring-black/40", // Solid
                // COPY-THIS: To apply the glow effect
                showGlow && "login-glow"
              )}
              style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}
              onClick={() => openChatbot()}
            >
              {isMobileCompact ? (
                <>
                  <div className="flex items-center gap-3">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-[8px] font-semibold">Hi! How can I assist you today?</span>
                  </div>
                  <div className="p-1 bg-primary rounded-lg">
                    <MessageCircleQuestion className="h-3 w-3 text-primary-foreground" />
                  </div>
                </>
              ) : (
                <Bot className="h-7 w-7 text-primary" />
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Sheet open={isOpen} onOpenChange={closeChatbot}>
        <SheetContent className="flex flex-col fixed inset-y-0 right-0 w-full max-w-md h-full bg-background">
          <SheetHeader>
            <SheetTitle>InvestWise AI Assistant</SheetTitle>
            <SheetDescription>
              {initialMessage}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 my-4 pr-4" ref={scrollAreaRef}>
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role !== "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                      message.role === "loading" && "animate-pulse"
                    )}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <FormattedMessage content={message.content} />
                    )}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="mt-auto">
            {file && (
              <div className="text-xs text-muted-foreground p-2">
                Attached: {file.name}
              </div>
            )}

            {/* Contextual Suggestions */}
            <div className="flex gap-2 p-2 overflow-x-auto hide-scrollbar">
              {useChatbotStore.getState().context.symbol && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 whitespace-nowrap"
                  onClick={() => {
                    const query = `Analyze ${useChatbotStore.getState().context.symbol} based on its current price of $${useChatbotStore.getState().context.price || '...'} and recent performance.`;
                    useChatbotStore.getState().openChatbot("Analyzing...", query);
                  }}
                >
                  Analyze {useChatbotStore.getState().context.symbol}
                </Button>
              )}
              {useChatbotStore.getState().context.route && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-muted/50 hover:bg-muted whitespace-nowrap"
                  onClick={() => {
                    const query = `I'm currently on the ${useChatbotStore.getState().context.route} page. Can you explain what I can do here and how to use the features on this page?`;
                    useChatbotStore.getState().openChatbot("Explaining page...", query);
                  }}
                >
                  Explain this page
                </Button>
              )}
              {/* Always show Explain Page using pathname */}
              {!useChatbotStore.getState().context.route && pathname && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-muted/50 hover:bg-muted whitespace-nowrap"
                  onClick={() => {
                    const pageName = pathname === '/' ? 'Home' : pathname.slice(1);
                    const query = `I'm currently on the ${pageName} page. Can you explain what I can do here and how to use the features on this page?`;
                    useChatbotStore.getState().openChatbot("Explaining page...", query);
                  }}
                >
                  Explain this page
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" variant="ghost" size="icon" onClick={handleFileAttach}>
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Attach file</span>
              </Button>

              {/* Microphone toggle for voice mode */}
              <Button
                type="button"
                variant={isVoiceMode ? "default" : "ghost"}
                size="icon"
                onClick={handleVoiceModeToggle}
                className={cn(
                  isVoiceMode && "bg-primary text-primary-foreground",
                  isListening && "animate-pulse ring-2 ring-primary",
                  isSpeaking && "ring-2 ring-green-500"
                )}
              >
                {isVoiceMode ? (
                  isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="sr-only">{isVoiceMode ? 'Disable voice mode' : 'Enable voice mode'}</span>
              </Button>

              {/* Voice mode: show listening toggle, otherwise show text input */}
              {isVoiceMode && isVoiceConnected ? (
                <div className="flex-1 flex items-center justify-center gap-2 px-4">
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "default"}
                    className="flex-1 gap-2"
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <><MicOff className="h-4 w-4" /> Stop Listening</>
                    ) : (
                      <><Mic className="h-4 w-4" /> Start Listening</>
                    )}
                  </Button>
                  {isSpeaking && (
                    <div className="flex items-center gap-1 text-green-500">
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      <span className="text-xs">Speaking...</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    autoComplete="off"
                    className="focus-visible:ring-primary"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() && !file}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </>
              )}
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
