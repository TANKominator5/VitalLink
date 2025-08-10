// src/lib/matching/compatibility.ts

export interface DonorProfile {
  id: string;
  full_name: string;
  blood_group: string;
  rh_factor: string;
  registration_time: string;
  willing_to_donate: string[];
  organ_details: OrganDetail[];
}

export interface RecipientProfile {
  id: string;
  full_name: string;
  blood_group: string;
  rh_factor: string;
  registration_time: string;
  required_organ: string;
  organ_details: OrganDetail[];
}

export interface OrganDetail {
  organ_type: string;
  blood_group?: string;
  rh_factor?: string;
  liver_fat_percentage?: number;
  body_weight_kg?: number;
  height_cm?: number;
  total_lung_capacity_ml?: number;
  predicted_total_lung_capacity_ml?: number;
}

export interface CompatibilityResult {
  compatible: boolean;
  compatibilityScore: number;
  reasons: string[];
  priority: number;
}

// Blood type compatibility matrix
const bloodCompatibility: { [recipient: string]: string[] } = {
  'O': ['O'],
  'A': ['A', 'O'],
  'B': ['B', 'O'],
  'AB': ['A', 'B', 'AB', 'O']
};

// Rh factor compatibility
const rhCompatibility = (donorRh: string, recipientRh: string): boolean => {
  if (recipientRh === 'Positive') return true;
  return donorRh === 'Negative';
};

export function checkOrganCompatibility(
  donor: DonorProfile,
  recipient: RecipientProfile,
  organ: string
): CompatibilityResult {
  const reasons: string[] = [];
  let compatibilityScore = 100;
  let compatible = true;

  const organLower = organ.toLowerCase();
  
  // Check if donor is willing to donate the required organ
  if (!donor.willing_to_donate.map(o => o.toLowerCase()).includes(organLower)) {
    compatible = false;
    reasons.push(`Donor is not willing to donate ${organ}`);
    return { compatible: false, compatibilityScore: 0, reasons, priority: Infinity };
  }

  // Get organ-specific details
  const donorOrganDetail = donor.organ_details.find(d => d.organ_type.toLowerCase() === organLower);
  const recipientOrganDetail = recipient.organ_details.find(d => d.organ_type.toLowerCase() === organLower);

  // Universal checks for organs that require blood type matching
  const organsRequiringBloodMatch = ['kidney', 'liver', 'pancreas', 'lung', 'blood', 'platelets'];
  
  if (organsRequiringBloodMatch.includes(organLower)) {
    // Use organ-specific blood group if available, otherwise use profile blood group
    const donorBloodGroup = donorOrganDetail?.blood_group || donor.blood_group;
    const recipientBloodGroup = recipientOrganDetail?.blood_group || recipient.blood_group;
    
    const compatibleBloodGroups = bloodCompatibility[recipientBloodGroup] || [];
    if (!compatibleBloodGroups.includes(donorBloodGroup)) {
      compatible = false;
      reasons.push(`Blood group incompatible: ${donorBloodGroup} → ${recipientBloodGroup}`);
      compatibilityScore -= 50;
    } else {
      reasons.push(`Blood group compatible: ${donorBloodGroup} → ${recipientBloodGroup}`);
    }

    // Use organ-specific Rh factor if available, otherwise use profile Rh factor
    const donorRhFactor = donorOrganDetail?.rh_factor || donor.rh_factor;
    const recipientRhFactor = recipientOrganDetail?.rh_factor || recipient.rh_factor;
    
    if (!rhCompatibility(donorRhFactor, recipientRhFactor)) {
      compatible = false;
      reasons.push(`Rh factor incompatible: ${donorRhFactor} → ${recipientRhFactor}`);
      compatibilityScore -= 30;
    } else {
      reasons.push(`Rh factor compatible: ${donorRhFactor} → ${recipientRhFactor}`);
    }
  }

  // Organ-specific compatibility checks
  switch (organLower) {
    case 'liver':
      if (donorOrganDetail?.liver_fat_percentage && donorOrganDetail.liver_fat_percentage > 35) {
        compatibilityScore -= 25;
        reasons.push(`High liver fat percentage: ${donorOrganDetail.liver_fat_percentage}%`);
      } else if (donorOrganDetail?.liver_fat_percentage) {
        reasons.push(`Acceptable liver fat percentage: ${donorOrganDetail.liver_fat_percentage}%`);
      }
      break;

    case 'pancreas':
      if (donorOrganDetail && recipientOrganDetail) {
        if (donorOrganDetail.body_weight_kg && recipientOrganDetail.body_weight_kg) {
          const weightDiff = Math.abs(donorOrganDetail.body_weight_kg - recipientOrganDetail.body_weight_kg);
          const weightDiffPercent = weightDiff / recipientOrganDetail.body_weight_kg;
          if (weightDiffPercent > 0.15) {
            compatibilityScore -= 20;
            reasons.push(`Weight difference too large: ${weightDiff.toFixed(1)}kg (${(weightDiffPercent * 100).toFixed(1)}%)`);
          } else {
            reasons.push(`Weight difference acceptable: ${weightDiff.toFixed(1)}kg`);
          }
        }
        
        if (donorOrganDetail.height_cm && recipientOrganDetail.height_cm) {
          const heightDiff = Math.abs(donorOrganDetail.height_cm - recipientOrganDetail.height_cm);
          const heightDiffPercent = heightDiff / recipientOrganDetail.height_cm;
          if (heightDiffPercent > 0.15) {
            compatibilityScore -= 20;
            reasons.push(`Height difference too large: ${heightDiff.toFixed(1)}cm (${(heightDiffPercent * 100).toFixed(1)}%)`);
          } else {
            reasons.push(`Height difference acceptable: ${heightDiff.toFixed(1)}cm`);
          }
        }
      }
      break;

    case 'lung':
      if (donorOrganDetail?.total_lung_capacity_ml && recipientOrganDetail?.predicted_total_lung_capacity_ml) {
        const donorCapacity = donorOrganDetail.total_lung_capacity_ml;
        const recipientNeeded = recipientOrganDetail.predicted_total_lung_capacity_ml;
        
        if (donorCapacity < recipientNeeded * 0.8 || donorCapacity > recipientNeeded * 1.2) {
          compatibilityScore -= 25;
          reasons.push(`Lung capacity mismatch: ${donorCapacity}ml vs needed ${recipientNeeded}ml`);
        } else {
          reasons.push(`Lung capacity compatible: ${donorCapacity}ml vs needed ${recipientNeeded}ml`);
        }
      }
      break;

    case 'platelets':
      // Stricter Rh matching for platelets
      const donorRh = donorOrganDetail?.rh_factor || donor.rh_factor;
      const recipientRh = recipientOrganDetail?.rh_factor || recipient.rh_factor;
      if (donorRh !== recipientRh) {
        compatible = false;
        reasons.push(`Strict Rh factor match required for platelets: ${donorRh} ≠ ${recipientRh}`);
      }
      break;

    default:
      reasons.push(`Basic compatibility check for ${organ}`);
  }

  // Calculate priority based on registration time (earlier = higher priority)
  const donorTime = new Date(donor.registration_time).getTime();
  const recipientTime = new Date(recipient.registration_time).getTime();
  const priority = Math.max(donorTime, recipientTime);

  // Final compatibility determination
  if (compatibilityScore < 50) {
    compatible = false;
  }

  return {
    compatible,
    compatibilityScore: Math.max(0, compatibilityScore),
    reasons,
    priority
  };
}

// Function to find matching donors for a recipient using the database function
export async function findMatchingDonorsFromDB(recipientUserId: string, supabase: any) {
  const { data, error } = await supabase.rpc('find_matches_for_recipient', {
    p_recipient_user_id: recipientUserId
  });

  if (error) {
    console.error('Error finding matches:', error);
    return [];
  }

  return data || [];
}
