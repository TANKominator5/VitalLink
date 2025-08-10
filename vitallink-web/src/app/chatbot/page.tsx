// src/app/chatbot/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { askAI } from "./actions";
import { Bot, User, CornerDownLeft } from "lucide-react";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const result = await askAI(input);

    let assistantMessage: Message;
      if ('error' in result && result.error) {
        assistantMessage = { role: 'assistant', content: `Error: ${result.error}` };
      } else if ('answer' in result) {
        assistantMessage = { role: 'assistant', content: result.answer || "No response found." };
      } else {
        assistantMessage = { role: 'assistant', content: "No response found." };
      }    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 flex flex-col h-[85vh]">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">AI Profile Assistant</h1>
        <p className="mt-2 text-muted-foreground">Ask questions about your profile information.</p>
        <p className="mt-1 text-xs text-muted-foreground">Examples: &ldquo;What organs am I willing to donate?&rdquo; or &ldquo;What is my blood type?&rdquo;</p>
      </header>
      
      <div className="flex-grow overflow-y-auto bg-card border border-border rounded-lg p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
            <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {msg.content}
            </div>
            {msg.role === 'user' && <User className="h-6 w-6 text-primary flex-shrink-0" />}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary flex-shrink-0 animate-pulse" />
                <div className="px-4 py-2 rounded-lg bg-secondary">
                    <span className="animate-pulse">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your profile..."
          className="w-full input-field"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
            <CornerDownLeft size={20} />
        </button>
      </form>
    </div>
  );
}