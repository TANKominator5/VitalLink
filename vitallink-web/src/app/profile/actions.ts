// src/app/profile/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateAndStoreEmbeddings } from "../chatbot/actions"; // This imports the function from the OTHER actions file

/**
 * This function handles updating a user's profile information.
 * After a successful update, it calls the embedding function to keep the AI's knowledge up-to-date.
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Get the current user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: "You must be logged in to update your profile." } };
  }

  // 2. Extract data from the form
  const role = formData.get('role') as string;

  // Prepare data for the 'profiles' table (common fields)
  const commonProfileData = {
    full_name: formData.get('full_name') as string,
    dob: formData.get('dob') as string,
    blood_group: formData.get('blood_group') as string,
    rh_factor: formData.get('rh_factor') as string,
  };

  // 3. Update the main profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update(commonProfileData)
    .eq('id', user.id);

  if (profileError) {
    console.error("Profile update error:", profileError);
    return { error: profileError };
  }

  // 4. Update the role-specific details table
  let roleSpecificError: { message?: string } | null = null;

  if (role === 'donor') {
    const donorSpecificData = {
      diagnosed_with: formData.get('diagnosed_with') as string,
      hla_factor: formData.get('hla_factor') as string,
      willing_to_donate: formData.getAll('willing_to_donate') as string[],
    };
    const { error } = await supabase
      .from('donor_details')
      .update(donorSpecificData)
      .eq('user_id', user.id);
    roleSpecificError = error;
  } else if (role === 'recipient') {
    const recipientSpecificData = {
      diagnosed_with: formData.get('diagnosed_with') as string,
      required_organ: formData.get('required_organ') as string,
    };
    const { error } = await supabase
      .from('recipient_details')
      .update(recipientSpecificData)
      .eq('user_id', user.id);
    roleSpecificError = error;
  }
  
  if (roleSpecificError) {
    console.error("Role-specific details update error:", roleSpecificError);
    return { error: roleSpecificError };
  }
  
  // 5. Trigger embedding generation after a successful update
  const embeddingResult = await generateAndStoreEmbeddings(user.id);
  
  if (embeddingResult?.error) {
      console.error("Embedding generation failed:", embeddingResult.error);
      // For now, we'll let the profile update succeed but log the embedding error.
      // You could return an error message to the user if this is critical.
  }

  // 6. Revalidate the profile path to reflect changes on the page immediately
  revalidatePath('/profile');
  
  return { success: true, error: null };
}