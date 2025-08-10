'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Bot, MessageCircle, X, Send, CornerDownLeft } from 'lucide-react'
import { askAI } from '@/app/chatbot/actions'

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function FloatingChatButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      // Show button after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        setTimeout(() => setIsVisible(true), 1000)
      } else {
        setIsVisible(false)
        setIsOpen(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Initialize with welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your VitalLink AI Assistant. I can help you with information about your profile. You can ask me about your blood type, account details, or any other profile information. How can I assist you today?',
        timestamp: new Date()
      }])
    }
  }, [isOpen, messages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    const result = await askAI(input)

    let assistantMessage: Message
    if (result.error) {
      assistantMessage = { 
        role: 'assistant', 
        content: `I'm sorry, but I encountered an error: ${result.error}`, 
        timestamp: new Date() 
      }
    } else {
      assistantMessage = { 
        role: 'assistant', 
        content: result.answer || "I'm sorry, I couldn't generate a response.", 
        timestamp: new Date() 
      }
    }
    
    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  // Don't show if not logged in or still loading
  if (loading || !user) {
    return null
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 z-50 w-80 h-96 bg-card border border-border rounded-lg shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold text-sm">VitalLink Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-64 bg-background">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-muted text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3 py-2 rounded-lg text-sm text-foreground">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:scale-110"
          title="AI Assistant"
        >
          {/* Button Icon */}
          {isOpen ? (
            <X className="h-6 w-6 transition-transform group-hover:scale-110" />
          ) : (
            <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
          )}
          
          {/* Pulse Animation - only when closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
          )}
        </button>
      </div>
    </>
  )
}
