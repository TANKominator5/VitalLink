// src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const role = requestUrl.searchParams.get('role') // Get role passed from GoogleButton

  if (code) {
    const supabase = await createClient()
    
    try {
      // Exchange the code for a user session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
      }

      if (data.user) {
        // Check if user already has a complete profile
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('profile_complete, role')
          .eq('id', data.user.id)
          .single();

        // If user has a complete profile, redirect to dashboard
        if (existingProfile && existingProfile.profile_complete) {
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
        }

        // If role was passed via URL parameter (Google OAuth), use it
        // Otherwise, try to get from user metadata (email/password signup) or existing profile
        const userRole = role || data.user.user_metadata?.role || existingProfile?.role;

        // Update user metadata with role if it came from URL parameter
        if (role && !data.user.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role: role }
          });
        }

        // For new users or incomplete profiles, redirect to appropriate onboarding
        if (userRole === 'donor') {
          return NextResponse.redirect(new URL('/onboarding/donor', requestUrl.origin));
        } else if (userRole === 'recipient') {
          return NextResponse.redirect(new URL('/onboarding/recipient', requestUrl.origin));
        } else if (userRole === 'medical_professional') {
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
        }
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', requestUrl.origin))
    }
  }

  // Default redirect to dashboard which will handle further redirects
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}