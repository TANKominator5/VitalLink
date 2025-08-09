// src/app/signup/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GoogleButton } from '@/components/GoogleButton';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor'); // 'donor' or 'medical_professional'
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Add custom metadata for the user's role
        data: {
          role: role,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      setSuccess("Success! Please check your email to confirm your account.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground border border-border rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign up to your account</h1>
          <p className="text-muted-foreground">to continue to VitalLink</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
            <div>
            <label htmlFor="role" className="text-sm font-medium">This account is for</label>
            <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="donor">A Donor</option>
                <option value="recipient">A Recipient</option>
                <option value="medical_professional">A Medical Professional</option>
            </select>
            </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full px-3 py-2 mt-1 border rounded-md bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          {success && <p className="text-sm text-center text-green-500">{success}</p>}

          <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Sign Up
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

        <GoogleButton selectedRole={role} />

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline text-foreground">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}