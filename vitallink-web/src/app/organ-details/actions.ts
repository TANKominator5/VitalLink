// src/app/organ-details/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveOrganDetails(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile) {
    throw new Error("Profile not found");
  }

  try {
    const rawData = Object.fromEntries(formData.entries());
    const organDetailsToSave = [];

    // Group form data by organ
    for (const key in rawData) {
      const parts = key.split('_');
      const organ = parts[0];
      const field = parts.slice(1).join('_');
      
      let existing: any = organDetailsToSave.find(d => d.organ_type === organ);
      if (!existing) {
        existing = { organ_type: organ, user_id: user.id };
        organDetailsToSave.push(existing);
      }
      existing[field] = rawData[key];
    }

    // Use the correct table based on role
    const tableName = profile.role === 'donor' ? 'donor_organ_details' : 'recipient_organ_details';

    // Use upsert to save all organ details
    const { error } = await supabase.from(tableName).upsert(organDetailsToSave, {
      onConflict: 'user_id,organ_type'
    });
    
    if (error) {
      console.error("Error saving organ details:", error);
      throw new Error("Failed to save organ details: " + error.message);
    }

    // Mark organ details as complete in the main profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organ_details_complete: true })
      .eq('id', user.id);
    
    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw new Error("Failed to mark profile as complete");
    }

    revalidatePath('/organ-details');
    redirect('/dashboard');
    
  } catch (error) {
    console.error("Error in saveOrganDetails:", error);
    throw error;
  }
}