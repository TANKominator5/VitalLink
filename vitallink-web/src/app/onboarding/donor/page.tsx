// src/app/onboarding/donor/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

const organs = [
    "kidney", "liver", "pancreas", "intestine", "lung", 
    "corneas", "blood", "platelets", "stem cells", "bone marrow"
];

export default function DonorSetupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrgans, setSelectedOrgans] = useState<string[]>([]);

    const handleCheckboxChange = (organ: string) => {
        setSelectedOrgans(prev => 
            prev.includes(organ) ? prev.filter(o => o !== organ) : [...prev, organ]
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("You must be logged in.");
            setIsLoading(false);
            return;
        }

        // Data for the 'profiles' table
        const commonProfileData = {
            full_name: formData.get('full_name') as string,
            dob: formData.get('dob') as string,
            blood_group: formData.get('blood_group') as string,
            rh_factor: formData.get('rh_factor') as string,
            profile_complete: true,
        };
        
        // Data for the 'donor_details' table
        const donorSpecificData = {
            hla_factor: formData.get('hla_factor') as string,
            diagnosed_with: formData.get('diagnosed_with') as string,
            willing_to_donate: selectedOrgans,
        };

        // Transaction: Update both tables
        const { error: profileError } = await supabase
            .from('profiles')
            .update(commonProfileData)
            .eq('id', user.id);

        const { error: donorError } = await supabase
            .from('donor_details')
            .update(donorSpecificData)
            .eq('user_id', user.id);

        if (profileError || donorError) {
            setError(profileError?.message || donorError?.message || "An unknown error occurred.");
        } else {
            router.push('/dashboard');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-card text-card-foreground border border-border rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Complete Your Donor Profile</h1>
                    <p className="text-muted-foreground">to continue to VitalLink</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* The form fields remain the same */}
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
                        <label htmlFor="rh_factor" className="text-sm font-medium">Rh Factor <span className="text-red-500">*</span></label>
                        <select id="rh_factor" name="rh_factor" required className="w-full mt-1 input-field">
                            <option value="">Select...</option>
                            <option value="Positive">Positive (+)</option><option value="Negative">Negative (-)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="hla_factor" className="text-sm font-medium">HLA Factor</label>
                        <input id="hla_factor" name="hla_factor" type="text" className="w-full mt-1 input-field" />
                    </div>
                    <div>
                        <label htmlFor="diagnosed_with" className="text-sm font-medium">Currently diagnosed with (If any)</label>
                        <textarea id="diagnosed_with" name="diagnosed_with" rows={3} className="w-full mt-1 input-field"></textarea>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Willing to donate <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-2 mt-2 p-4 border border-input rounded-md">
                            {organs.map(organ => (
                                <label key={organ} className="flex items-center space-x-2 capitalize">
                                    <input type="checkbox" checked={selectedOrgans.includes(organ)} onChange={() => handleCheckboxChange(organ)} className="rounded" />
                                    <span>{organ}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}

                    <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {isLoading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}