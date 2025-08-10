 // components/FloatingChatButton.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Bot, X, Send } from 'lucide-react'
import { askAI } from '@/app/chatbot/actions'
import { useTheme } from 'next-themes'

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export default function FloatingChatButton() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

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
        content: 'Hello! I\'m your VitalLink AI Assistant. I can help you with information about your profile, answer general health questions, or provide guidance on organ donation. Feel free to ask me anything about your account, blood types, medical topics, or how organ donation works. How can I assist you today?',
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
    if ('error' in result && result.error) {
      assistantMessage = { 
        role: 'assistant', 
        content: `I'm sorry, but I encountered an error: ${result.error}`, 
        timestamp: new Date() 
      }
    } else if ('answer' in result) {
      assistantMessage = { 
        role: 'assistant', 
        content: result.answer || "I'm sorry, I couldn't generate a response.", 
        timestamp: new Date() 
      }
    } else {
      assistantMessage = { 
        role: 'assistant', 
        content: "I'm sorry, I couldn't generate a response.", 
        timestamp: new Date() 
      }
    }
    
    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  // Don't show if not logged in, still loading, or not mounted
  if (!mounted || loading || !user) {
    return null
  }

  const isDarkMode = theme === 'dark'

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 z-50 w-80 h-[500px] rounded-xl shadow-xl transition-all duration-300 flex flex-col overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        } border`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">VitalLink Assistant</h3>
                <p className="text-xs text-blue-100">AI-powered health companion</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md shadow-sm' 
                      : `${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-100 border-gray-600' 
                            : 'bg-white text-gray-800 border-gray-200'
                        } border rounded-bl-md shadow-sm`
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`px-4 py-2.5 rounded-2xl rounded-bl-md text-sm shadow-sm border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-400 border-gray-600' 
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">AI is typing</span>
                      <div className="flex space-x-1 ml-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className={`p-4 border-t flex-shrink-0 ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about health or your profile..."
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder:text-gray-400' 
                      : 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500'
                  }`}
                  disabled={isTyping}
                />
              </div>
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-95'
      }`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-110"
          title="VitalLink AI Assistant"
        >
          {/* Button Icon */}
          <div className="relative z-10">
            {isOpen ? (
              <X className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <Bot className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            )}
          </div>
          
          {/* Pulse Animation - only when closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
          )}
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </>
  )
}
