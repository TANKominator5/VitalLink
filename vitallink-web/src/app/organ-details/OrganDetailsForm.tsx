// src/app/organ-details/OrganDetailsForm.tsx
"use client";

import { useState } from 'react';
import { saveOrganDetails } from './actions';

// --- Reusable Form Field Components ---
const BloodGroupField = ({ organ }: { organ: string }) => (
  <div className="space-y-2">
    <label htmlFor={`${organ}_blood_group`} className="text-sm font-medium">Blood Group</label>
    <select name={`${organ}_blood_group`} required className="w-full input-field">
      <option value="">Select...</option>
      <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
    </select>
  </div>
);

const RhFactorField = ({ organ }: { organ: string }) => (
   <div className="space-y-2">
      <label className="text-sm font-medium">Rh Factor</label>
      <div className="flex gap-4">
          <label><input type="radio" name={`${organ}_rh_factor`} value="+ve" required/> +ve</label>
          <label><input type="radio" name={`${organ}_rh_factor`} value="-ve" required/> -ve</label>
      </div>
   </div>
);

const OrganCard = ({ organ, role }: { organ: string, role: string }) => {
  const organName = organ.charAt(0).toUpperCase() + organ.slice(1);
  
  // Conditionally render fields based on the wireframe
  return (
    <div className="bg-card border border-border p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-foreground">{organName}</h2>
      
      {(organ === 'blood' || organ === 'platelets') && <>
        <BloodGroupField organ={organ} />
        <RhFactorField organ={organ} />
      </>}

      {(organ === 'kidney' || organ === 'pancreas' || organ === 'lung' || organ === 'liver') && <>
        <div className="space-y-2">
          <label htmlFor={`${organ}_blood_type`} className="text-sm font-medium">Enter Blood Type</label>
          <input name={`${organ}_blood_type`} type="text" className="w-full input-field" placeholder="e.g., A+" required />
        </div>
      </>}
      
      {organ === 'liver' && role === 'donor' && <div className="space-y-2">
        <label htmlFor="liver_liver_fat_percentage" className="text-sm font-medium">Enter Liver Fat %</label>
        <input name="liver_liver_fat_percentage" type="number" step="0.1" className="w-full input-field" />
      </div>}

      {organ === 'pancreas' && <>
        <div className="space-y-2">
          <label htmlFor="pancreas_body_weight_kg" className="text-sm font-medium">Enter Body Weight (kg)</label>
          <input name="pancreas_body_weight_kg" type="number" step="0.1" className="w-full input-field" />
        </div>
        <div className="space-y-2">
          <label htmlFor="pancreas_height_cm" className="text-sm font-medium">Enter Height (cm)</label>
          <input name="pancreas_height_cm" type="number" step="0.1" className="w-full input-field" />
        </div>
      </>}

      {organ === 'lung' && <>
        <div className="space-y-2">
          <label htmlFor="lung_total_lung_capacity_ml" className="text-sm font-medium">
            {role === 'donor' ? 'Enter Total Lung Capacity (TLC) in ml' : 'Enter Predicted TLC (ml)'}
          </label>
          <input name={role === 'donor' ? 'lung_total_lung_capacity_ml' : 'lung_predicted_total_lung_capacity_ml'} type="number" className="w-full input-field" />
        </div>
      </>}

      {(organ === 'corneas' || organ === 'stem cells' || organ === 'bone marrow') && <>
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Notes</label>
          <textarea name={`${organ}_notes`} rows={3} className="w-full input-field" placeholder="Any additional information..."></textarea>
        </div>
      </>}

      {organ === 'intestine' && <>
        <div className="space-y-2">
          <label htmlFor="intestine_blood_type" className="text-sm font-medium">Enter Blood Type</label>
          <input name="intestine_blood_type" type="text" className="w-full input-field" placeholder="e.g., A+" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Medical Notes</label>
          <textarea name="intestine_medical_notes" rows={2} className="w-full input-field" placeholder="Any specific medical conditions..."></textarea>
        </div>
      </>}
    </div>
  );
};

interface OrganDetailsFormProps {
  organs: string[];
  role: string;
}

export default function OrganDetailsForm({ organs, role }: OrganDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      await saveOrganDetails(formData);
      // If we reach here without error, the redirect in the action will handle navigation
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving your details.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {organs.map((organ: string) => (
          <OrganCard key={organ} organ={organ.toLowerCase()} role={role} />
        ))}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-12">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Details & Complete Profile'}
        </button>
      </div>
    </form>
  );
}
