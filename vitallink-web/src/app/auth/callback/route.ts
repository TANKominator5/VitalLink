// src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') // Get role from URL parameter

  if (code) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
      }

      if (data.user) {
        // If role was passed via URL parameter (Google OAuth), use it
        // Otherwise, try to get from user metadata (email/password signup)
        const userRole = role || data.user.user_metadata?.role

        // Update user metadata with role if it came from URL parameter
        if (role && !data.user.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role: role }
          })
        }

        // Redirect based on role
        if (userRole === 'donor') {
          return NextResponse.redirect(new URL('/onboarding/donor', requestUrl.origin))
        } else if (userRole === 'recipient') {
          return NextResponse.redirect(new URL('/onboarding/recipient', requestUrl.origin))
        } else if (userRole === 'medical_professional') {
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
        }
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
    }
  }

  // Default redirect to homepage if no specific role is found
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}