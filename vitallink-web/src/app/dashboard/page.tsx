// src/app/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Get user session, redirect to login if not found
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // 2. Try to fetch the user's profile from the 'profiles' table
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. LOGIC FOR NEW USERS: If no profile exists, create it
  if (!profile) {
    console.log("No profile found for user, creating one...");

    const userRole = user.user_metadata?.role;
    if (!userRole) {
      // If role is missing, it's a critical error. Sign out and redirect.
      await supabase.auth.signOut();
      return redirect('/login?error=user_role_not_found');
    }

    // Prepare the new profile record
    const profileData = {
      id: user.id, 
      role: userRole,
      // Medical professionals skip the multi-step onboarding, so their profile is complete by default.
      profile_complete: userRole === 'medical_professional',
      organ_details_complete: userRole === 'medical_professional',
    };
    
    // Insert the new profile record
    const { data: newProfile, error: profileInsertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileInsertError) {
      console.error("Error creating profile:", profileInsertError);
      await supabase.auth.signOut();
      return redirect('/login?error=profile_creation_failed');
    }
    
    // Create the corresponding role-specific details record (if applicable)
    if (userRole === 'donor') {
      const { error: donorInsertError } = await supabase
        .from('donor_details')
        .insert({ user_id: user.id });
        
      if (donorInsertError) {
         console.error("Error creating donor details:", donorInsertError);
      }
    } else if (userRole === 'recipient') {
      const { error: recipientInsertError } = await supabase
        .from('recipient_details')
        .insert({ user_id: user.id });
      
      if (recipientInsertError) {
         console.error("Error creating recipient details:", recipientInsertError);
      }
    }
    
    // Use the newly created profile for subsequent checks
    profile = newProfile;
  }

  // 4. CHECKPOINT 1: Check if initial onboarding is complete
  if (!profile.profile_complete) {
    const role = profile.role;
    if (role === 'donor' || role === 'recipient') {
      return redirect(`/onboarding/${role}`);
    }
  }
  
  // 5. CHECKPOINT 2: Check if organ details step is complete
  if (!profile.organ_details_complete) {
      const role = profile.role;
      if (role === 'donor' || role === 'recipient') {
          return redirect('/organ-details');
      }
  }

  // 6. RENDER DASHBOARD (Happy Path): If all checks pass, show the main dashboard
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
              Thank you for providing your details. Your account is active and ready.
            </p>
        </div>
      </div>
    </div>
  );
}