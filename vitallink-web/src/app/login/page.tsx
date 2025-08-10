// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { GoogleButton } from '@/components/GoogleButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState('donor'); // For Google OAuth role selection
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Check if user has completed their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_complete, role')
        .eq('id', data.user.id)
        .single();

      // If profile is complete, go to dashboard
      if (profile && profile.profile_complete) {
        router.push('/dashboard');
      } else {
        // Get user's role from profile or metadata
        const userRole = profile?.role || data.user.user_metadata?.role;
        
        // Redirect based on role for incomplete profiles
        if (userRole === 'donor') {
          router.push('/onboarding/donor');
        } else if (userRole === 'recipient') {
          router.push('/onboarding/recipient');
        } else if (userRole === 'medical_professional') {
          router.push('/dashboard');
        } else {
          // If no role is set, redirect to default dashboard
          router.push('/dashboard');
        }
      }
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground border border-border rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <p className="text-muted-foreground">to continue to VitalLink</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 input-field"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <label htmlFor="remember-me" className="ml-2 block text-sm">Remember me</label>
            </div>
            <div className="text-sm">
              <Link href="/forgot-password"className="font-semibold hover:underline">Forgot Password?</Link>
            </div>
          </div>
          
          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Sign In
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">or</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="google-role" className="text-sm font-medium mb-2 block">For Google sign-in, I am a:</label>
          <select
            id="google-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full input-field"
          >
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
            <option value="medical_professional">Medical Professional</option>
          </select>
        </div>
        
        <GoogleButton selectedRole={role} />

        <p className="text-sm text-center text-muted-foreground">
          Need to create an account?{' '}
          <Link href="/signup" className="font-semibold hover:underline text-foreground">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}