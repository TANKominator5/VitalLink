// src/app/profile/UserProfileClient.tsx
"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

const ViewRow = ({ label, value }: { label: string; value: string | string[] | null | undefined }) => {
    // Only render the row if there is a value to display
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 capitalize">{displayValue}</dd>
        </div>
    );
};

const EditRow = ({ label, name, defaultValue, required = false, type = "text", children }: any) => (
    <div className="py-2">
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground">{label}{required && <span className="text-red-500">*</span>}</label>
        <div className="mt-1">
            {children || <input type={type} name={name} id={name} defaultValue={defaultValue || ''} required={required} className="w-full input-field" />}
        </div>
    </div>
);

export function UserProfileClient({ profile, details }: { profile: any, details: any | null }) {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Safely initialize state, even if details is null
    const [selectedOrgans, setSelectedOrgans] = useState<string[]>(details?.willing_to_donate || []);
    
    const handleCheckboxChange = (organ: string) => {
        setSelectedOrgans(prev => 
            prev.includes(organ) ? prev.filter(o => o !== organ) : [...prev, organ]
        );
    };
    
    const organsList = ["kidney", "liver", "pancreas", "intestine", "lung", "corneas", "blood", "platelets", "stem cells", "bone marrow"];

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        selectedOrgans.forEach(organ => formData.append('willing_to_donate', organ));
        const result = await updateProfile(formData);

        if (result?.error) {
            setError(result.error.message);
            setSuccess(null);
        } else {
            setSuccess("Profile updated successfully!");
            setError(null);
            setIsEditing(false);
        }
    };

    // If a user has a role with no details (like medical_professional), show a simplified view.
    if (!details && profile.role !== 'donor' && profile.role !== 'recipient') {
         return (
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold leading-6 text-foreground">Profile Information</h3>
                <div className="mt-4 border-t border-border">
                    <dl className="divide-y divide-border">
                        <ViewRow label="Full Name" value={profile.full_name} />
                        <ViewRow label="Role" value={profile.role} />
                        <ViewRow label="Account Status" value="Verified" />
                    </dl>
                    <p className="mt-4 text-sm text-muted-foreground">This role does not require additional profile details.</p>
                </div>
            </div>
        );
    }

    // --- VIEW MODE ---
    if (!isEditing) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold leading-6 text-foreground">Profile Information</h3>
                        <div className="mt-2">
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {profile?.role === 'medical_professional' ? 'Medical Professional' : 
                                 profile?.role === 'donor' ? 'Organ Donor' : 
                                 profile?.role === 'recipient' ? 'Organ Recipient' : 
                                 'User'}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit Profile</button>
                </div>
                {success && <p className="mt-4 text-sm text-center text-green-500">{success}</p>}
                <div className="mt-4 border-t border-border">
                    <dl className="divide-y divide-border">
                        <ViewRow 
                            label="Account Type" 
                            value={profile?.role === 'medical_professional' ? 'Medical Professional' : 
                                   profile?.role === 'donor' ? 'Organ Donor' : 
                                   profile?.role === 'recipient' ? 'Organ Recipient' : 
                                   'User'} 
                        />
                        <ViewRow label="Full Name" value={profile.full_name} />
                        <ViewRow label="Date of Birth" value={profile.dob} />
                        <ViewRow label="Blood Group" value={profile.blood_group} />
                        <ViewRow label="Rh Factor" value={profile.rh_factor} />
                        {/* Safely access details properties */}
                        <ViewRow label="Currently Diagnosed With" value={details?.diagnosed_with} />
                        {profile.role === 'donor' && <>
                            <ViewRow label="HLA Factor" value={details?.hla_factor} />
                            <ViewRow label="Willing to Donate" value={details?.willing_to_donate} />
                        </>}
                        {profile.role === 'recipient' && <ViewRow label="Required Organ" value={details?.required_organ} />}
                    </dl>
                </div>
            </div>
        );
    }

    // --- EDIT MODE ---
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <form onSubmit={handleFormSubmit}>
                <input type="hidden" name="role" value={profile.role} />
                <h3 className="text-lg font-semibold leading-6 text-foreground mb-4">Edit Profile Information</h3>
                
                <div className="space-y-4">
                    <EditRow label="Full Name" name="full_name" defaultValue={profile.full_name} required />
                    <EditRow label="Date of Birth" name="dob" defaultValue={profile.dob} type="date" required />
                    <EditRow label="Blood Group" name="blood_group" defaultValue={profile.blood_group} required>
                        <select name="blood_group" id="blood_group" defaultValue={profile.blood_group} className="w-full input-field">
                            <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                        </select>
                    </EditRow>
                    <EditRow label="Rh Factor" name="rh_factor" defaultValue={profile.rh_factor} required>
                         <select name="rh_factor" id="rh_factor" defaultValue={profile.rh_factor} className="w-full input-field">
                            <option value="Positive">Positive (+)</option><option value="Negative">Negative (-)</option>
                        </select>
                    </EditRow>
                     {/* Safely access details properties for defaultValues */}
                     <EditRow label="Currently Diagnosed With" name="diagnosed_with" defaultValue={details?.diagnosed_with}>
                        <textarea name="diagnosed_with" id="diagnosed_with" defaultValue={details?.diagnosed_with || ''} rows={3} className="w-full input-field" />
                     </EditRow>

                    {profile.role === 'donor' && <>
                        <EditRow label="HLA Factor" name="hla_factor" defaultValue={details?.hla_factor} />
                        <div className="py-2">
                            <label className="block text-sm font-medium text-muted-foreground">Willing to Donate</label>
                            <div className="grid grid-cols-2 gap-2 mt-2 p-4 border border-input rounded-md">
                                {organsList.map(organ => (
                                    <label key={organ} className="flex items-center space-x-2 capitalize">
                                        <input type="checkbox" checked={selectedOrgans.includes(organ)} onChange={() => handleCheckboxChange(organ)} className="rounded" />
                                        <span>{organ}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>}

                    {profile.role === 'recipient' && <EditRow label="Required Organ" name="required_organ" defaultValue={details?.required_organ} required />}
                </div>

                {error && <p className="mt-4 text-sm text-center text-red-500">{error}</p>}

                <div className="mt-6 flex items-center justify-end gap-x-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save Changes</button>
                </div>
            </form>
        </div>
    );
}