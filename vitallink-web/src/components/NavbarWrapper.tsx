'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import Navbar from './Navbar'
import type { User } from '@supabase/supabase-js'

export default function NavbarWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    // Return a loading state that matches the final navbar structure
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 w-full items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold">VitalLink</div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-muted animate-pulse"></div>
            <div className="w-16 h-8 rounded-md bg-muted animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  // Determine user role from metadata, default to 'none' if not logged in or no role
  const userRole = user?.user_metadata?.role ?? 'none'

  return <Navbar userRole={userRole} />
}
