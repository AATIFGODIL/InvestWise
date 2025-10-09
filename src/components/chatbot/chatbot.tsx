
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Bot, Send, User, MessageCircleQuestion } from "lucide-react";
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

interface Message {
  role: "user" | "ai" | "loading";
  content: string;
}

export default function Chatbot() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { isOpen, openChatbot, closeChatbot, initialMessage } = useChatbotStore();
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage, { role: "loading", content: "..." }]);
    setInput("");

    try {
      const result = await handleInvestmentQuery(input);
      if (result.success) {
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.role !== "loading");
          return [...newMessages, { role: "ai", content: result.response }];
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.filter((msg) => msg.role !== "loading"));
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Couldn't get a response from the AI. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <Button
          variant="outline"
          className={cn(
              "w-full justify-between items-center p-3 h-auto rounded-full shadow-2xl shadow-black/20 ring-1 ring-white/60 hover:bg-primary/10",
               isClearMode 
                ? isLightClear
                    ? "bg-card/60 text-foreground" // Light Clear
                    : "bg-white/10 text-white" // Dark Clear
                : "bg-card text-card-foreground" // Solid
          )}
          style={{ backdropFilter: isClearMode ? "url(#frosted) blur(1px)" : "none" }}
          onClick={() => openChatbot()}
        >
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-sm font-semibold">Hi! How can I assist you today?</span>
          </div>
          <div className="p-2 bg-primary rounded-lg">
            <MessageCircleQuestion className="h-5 w-5 text-primary-foreground" />
          </div>
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={closeChatbot}>
        <SheetContent className="flex flex-col">
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
            </div>
          </ScrollArea>
          <div className="mt-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
