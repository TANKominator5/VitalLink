// src/app/onboarding/recipient/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function RecipientSetupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in to submit this form.");
            return;
        }

        const profileData = {
            id: user.id,
            full_name: formData.get('full_name') as string,
            dob: formData.get('dob') as string,
            blood_group: formData.get('blood_group') as string,
            diagnosed_with: formData.get('diagnosed_with') as string,
            required_organ: formData.get('required_organ') as string,
            profile_complete: true,
        };

        const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-card text-card-foreground border border-border rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Complete Your Recipient Profile</h1>
                    <p className="text-muted-foreground">to continue to VitalLink</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="full_name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                        <input id="full_name" name="full_name" type="text" required className="w-full mt-1 input-field" />
                    </div>
                    <div>
                        <label htmlFor="dob" className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                        <input id="dob" name="dob" type="date" required className="w-full mt-1 input-field" />
                    </div>
                    <div>
                        <label htmlFor="blood_group" className="text-sm font-medium">Blood Group <span className="text-red-500">*</span></label>
                        <select id="blood_group" name="blood_group" required className="w-full mt-1 input-field">
                            <option value="">Select...</option>
                            <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="diagnosed_with" className="text-sm font-medium">Currently diagnosed with</label>
                        <textarea id="diagnosed_with" name="diagnosed_with" rows={3} className="w-full mt-1 input-field"></textarea>
                    </div>
                     <div>
                        <label htmlFor="required_organ" className="text-sm font-medium">Required Organ or Tissue <span className="text-red-500">*</span></label>
                        <input id="required_organ" name="required_organ" type="text" required className="w-full mt-1 input-field" placeholder="e.g., Kidney, Liver" />
                    </div>
                    
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}

                    <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    );
}