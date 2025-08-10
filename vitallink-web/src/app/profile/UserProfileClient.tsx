// src/app/profile/UserProfileClient.tsx
"use client";

import { useState } from "react";
import { updateProfile } from "./actions"; // Import the server action

// Helper component for displaying a row of data
const ViewRow = ({ label, value }: { label: string; value: string | string[] | null | undefined }) => {
    if (!value) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 capitalize">{displayValue || 'Not provided'}</dd>
        </div>
    );
};

// Helper component for an input field in the form
const EditRow = ({ label, name, defaultValue, required = false, type = "text", children }: any) => (
    <div className="py-2">
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground">{label}{required && <span className="text-red-500">*</span>}</label>
        <div className="mt-1">
            {children || <input type={type} name={name} id={name} defaultValue={defaultValue} required={required} className="w-full input-field" />}
        </div>
    </div>
);

// Main client component
export function UserProfileClient({ profile, details }: { profile: any, details: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // State for the checkboxes in edit mode
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
        
        // Append checkbox data to formData before submitting
        selectedOrgans.forEach(organ => formData.append('willing_to_donate', organ));

        const result = await updateProfile(formData);

        if (result?.error) {
            setError(result.error.message);
            setSuccess(null);
        } else {
            setSuccess("Profile updated successfully!");
            setError(null);
            setIsEditing(false); // Exit edit mode on success
        }
    };

    if (!isEditing) {
        return (
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold leading-6 text-foreground">Profile Information</h3>
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit Profile</button>
                </div>
                {success && <p className="mt-4 text-sm text-center text-green-500">{success}</p>}
                <div className="mt-4 border-t border-border">
                    <dl className="divide-y divide-border">
                        <ViewRow label="Full Name" value={profile.full_name} />
                        <ViewRow label="Date of Birth" value={profile.dob} />
                        <ViewRow label="Blood Group" value={profile.blood_group} />
                        <ViewRow label="Rh Factor" value={profile.rh_factor} />
                        <ViewRow label="Currently Diagnosed With" value={details.diagnosed_with} />
                        {profile.role === 'donor' && <>
                            <ViewRow label="HLA Factor" value={details.hla_factor} />
                            <ViewRow label="Willing to Donate" value={details.willing_to_donate} />
                        </>}
                        {profile.role === 'recipient' && <ViewRow label="Required Organ" value={details.required_organ} />}
                    </dl>
                </div>
            </div>
        );
    }

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
                     <EditRow label="Currently Diagnosed With" name="diagnosed_with" defaultValue={details.diagnosed_with}>
                        <textarea name="diagnosed_with" id="diagnosed_with" defaultValue={details.diagnosed_with} rows={3} className="w-full input-field" />
                     </EditRow>

                    {profile.role === 'donor' && <>
                        <EditRow label="HLA Factor" name="hla_factor" defaultValue={details.hla_factor} />
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

                    {profile.role === 'recipient' && <EditRow label="Required Organ" name="required_organ" defaultValue={details.required_organ} required />}
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