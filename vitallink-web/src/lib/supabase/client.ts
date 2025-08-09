// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlhsiroctxganxnootue.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saHNpcm9jdHhnYW54bm9vdHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NDA5MjYsImV4cCI6MjA3MDMxNjkyNn0.F72oN8ZEVH8HMQlHH9iVyq_ntRfNhBAZv97vkcji6rM'
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}