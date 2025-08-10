// src/app/profile/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: "You must be logged in to update your profile." } };
  }

  // Get the user role from a hidden form input
  const role = formData.get('role') as string;

  // Prepare data for the 'profiles' table (common fields)
  const commonProfileData = {
    full_name: formData.get('full_name') as string,
    dob: formData.get('dob') as string,
    blood_group: formData.get('blood_group') as string,
    rh_factor: formData.get('rh_factor') as string,
  };

  // --- Update the main profiles table ---
  const { error: profileError } = await supabase
    .from('profiles')
    .update(commonProfileData)
    .eq('id', user.id);

  if (profileError) {
    console.error("Profile update error:", profileError);
    return { error: profileError };
  }

  // --- Update the role-specific details table ---
  if (role === 'donor') {
    const donorSpecificData = {
      diagnosed_with: formData.get('diagnosed_with') as string,
      hla_factor: formData.get('hla_factor') as string,
      willing_to_donate: formData.getAll('willing_to_donate') as string[], // .getAll() correctly captures multiple checkbox values
    };
    const { error: donorError } = await supabase
      .from('donor_details')
      .update(donorSpecificData)
      .eq('user_id', user.id);
    
    if (donorError) {
      console.error("Donor details update error:", donorError);
      return { error: donorError };
    }
  } else if (role === 'recipient') {
    const recipientSpecificData = {
      diagnosed_with: formData.get('diagnosed_with') as string,
      required_organ: formData.get('required_organ') as string,
    };
    const { error: recipientError } = await supabase
      .from('recipient_details')
      .update(recipientSpecificData)
      .eq('user_id', user.id);
      
    if (recipientError) {
      console.error("Recipient details update error:", recipientError);
      return { error: recipientError };
    }
  }
  
  // Revalidate the path to show the updated data immediately
  revalidatePath('/profile');
  return { success: true };
}