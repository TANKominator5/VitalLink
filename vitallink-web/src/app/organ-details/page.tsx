// src/app/organ-details/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrganDetailsForm from "./OrganDetailsForm";

export default async function OrganDetailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile) {
    console.error('Profile error:', profileError);
    return redirect('/dashboard?error=profile_incomplete');
  }

  let details: { willing_to_donate?: string[]; required_organ?: string } = {};
  
  if (profile.role === 'donor') {
    const { data } = await supabase.from('donor_details').select('willing_to_donate').eq('user_id', user.id).single();
    details = data || {};
  } else if (profile.role === 'recipient') {
    const { data } = await supabase.from('recipient_details').select('required_organ').eq('user_id', user.id).single();
    details = data || {};
  }
  
  const organsToList = profile.role === 'donor' 
    ? (details.willing_to_donate || []).filter(Boolean)
    : [details.required_organ].filter((organ): organ is string => Boolean(organ));

  if (!organsToList || organsToList.length === 0 || (organsToList.length === 1 && !organsToList[0])) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">No organs selected</h1>
        <p className="text-muted-foreground mb-6">Please go back to your profile to select organs to donate or receive.</p>
        <a href="/profile" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go to Profile
        </a>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Organ Details</h1>
        <p className="mt-2 text-muted-foreground">
          Please provide the following specific details for the organs you selected.
        </p>
      </header>
      
      <OrganDetailsForm 
        organs={organsToList} 
        role={profile.role} 
      />
    </div>
  );
}