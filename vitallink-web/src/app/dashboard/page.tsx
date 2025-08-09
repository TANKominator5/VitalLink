// src/app/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Get user's profile from the 'profiles' table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single(); // .single() assumes one-to-one relationship and returns a single object

  // If there's no profile or it's not complete, redirect to the correct setup page
  if (!profile || !profile.profile_complete) {
    const role = profile?.role || user.user_metadata?.role;
    
    if (role === 'donor') {
      return redirect('/onboarding/donor');
    } else if (role === 'recipient') {
      return redirect('/onboarding/recipient');
    } else if (role === 'medical_professional') {
      // You can create a setup page for medical professionals later
      // For now, we'll just let them pass
    } else {
       // Handle cases where role is not set or is unexpected
       return redirect('/login?error=invalid_role');
    }
  }

  // If profile is complete, render the dashboard:
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          This is your main hub. All your information and updates will appear here.
        </p>
      </header>

      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
              <User size={28} />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {user.email}
            </p>
            <span className="text-sm font-medium text-white px-2 py-1 rounded-full bg-blue-600 capitalize">
              {profile?.role ? profile.role.replace('_', ' ') : 'User'}
            </span>
          </div>
        </div>
        
        <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center text-green-500">
                <ShieldCheck size={20} className="mr-2" />
                <h3 className="font-semibold">Profile Complete & Verified</h3>
            </div>
            <p className="text-muted-foreground mt-2">
              Thank you for providing your details. Your account is active.
            </p>
        </div>
      </div>
    </div>
  );
}