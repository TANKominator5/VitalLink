// src/components/GoogleButton.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { Chrome } from "lucide-react";

export const GoogleButton = () => {
  const supabase = createClient();
  
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center w-full px-4 py-2 border border-border rounded-md hover:bg-accent"
    >
      <Chrome size={20} className="mr-2" />
      Sign in with Google
    </button>
  );
};