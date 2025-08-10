// src/app/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserProfileClient } from "./UserProfileClient"; // We will create this next

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch the main profile to get the role and common data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError || !profile) {
    // This might happen if the profile creation trigger failed
    return redirect('/dashboard?error=profile_not_found');
  }

  let details = null;
  let detailsError = null;

  // Based on the role, fetch from the corresponding details table
  if (profile.role === 'donor') {
    ({ data: details, error: detailsError } = await supabase
      .from('donor_details')
      .select('*')
      .eq('user_id', user.id)
      .single());
  } else if (profile.role === 'recipient') {
    ({ data: details, error: detailsError } = await supabase
      .from('recipient_details')
      .select('*')
      .eq('user_id', user.id)
      .single());
  }
  
  if (detailsError) {
    console.error("Error fetching details:", detailsError);
    // Render an error message or redirect
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
       <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">My Profile</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your personal and medical information.
          </p>
        </header>
      {/* We pass all the fetched data to the client component */}
      <UserProfileClient profile={profile} details={details} />
    </div>
  );
}