'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Link from 'next/link'
import { Bot, MessageCircle, X } from 'lucide-react'

export default function FloatingChatButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

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
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Don't show button if not logged in or still loading
  if (loading || !user) {
    return null
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
    }`}>
      <Link
        href="/chatbot"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:scale-110"
        title="AI Assistant"
      >
        {/* Button Icon */}
        <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
        
        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20"></div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
          <div className="relative">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              AI Assistant
              {/* Tooltip Arrow */}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Optional: Add notification badge for unread messages */}
      {/* Uncomment if you want to add notification functionality later
      <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
        !
      </div>
      */}
    </div>
  )
}
