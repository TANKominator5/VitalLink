// src/app/matching/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MatchingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organ_details_complete')
    .eq('id', user.id)
    .single();

  if (!profile?.organ_details_complete) {
    return redirect('/organ-details');
  }

  let matches: any[] = [];

  if (profile.role === 'recipient') {
    // Use the database function to find matching donors
    const { data: dbMatches, error } = await supabase.rpc('find_matches_for_recipient', {
      p_recipient_user_id: user.id
    });

    if (error) {
      console.error('Error finding matches:', error);
    } else {
      matches = dbMatches || [];
    }
  } else if (profile.role === 'donor') {
    // For donors, find recipients who need their organs
    const { data: donorDetails } = await supabase
      .from('donor_details')
      .select('willing_to_donate')
      .eq('user_id', user.id)
      .single();

    if (donorDetails?.willing_to_donate) {
      // Find recipients who need any of the organs this donor is willing to donate
      const { data: recipients } = await supabase
        .from('recipient_details')
        .select(`
          user_id,
          required_organ,
          profiles!recipient_details_user_id_fkey (
            full_name,
            blood_group,
            rh_factor,
            registration_time
          )
        `)
        .in('required_organ', donorDetails.willing_to_donate);

      if (recipients) {
        // Get donor's organ details for compatibility checking
        const { data: donorOrganDetails } = await supabase
          .from('donor_organ_details')
          .select('*')
          .eq('user_id', user.id);

        matches = recipients.map((recipient: any) => {
          // Find matching organ details
          const matchingOrganDetail = donorOrganDetails?.find(
            (detail: any) => detail.organ_type === recipient.required_organ
          );

          // Simple compatibility score calculation
          let compatibilityScore = 100;
          const reasons: string[] = [];

          if (matchingOrganDetail) {
            // Check blood compatibility
            const recipientBloodGroup = recipient.profiles?.blood_group || '';
            const donorBloodGroup = matchingOrganDetail.blood_group || '';
            
            const bloodCompatibility: { [key: string]: string[] } = {
              'O': ['O'],
              'A': ['A', 'O'],
              'B': ['B', 'O'],
              'AB': ['A', 'B', 'AB', 'O']
            };

            const compatibleGroups = bloodCompatibility[recipientBloodGroup] || [];
            if (!compatibleGroups.includes(donorBloodGroup)) {
              compatibilityScore -= 50;
              reasons.push(`Blood group incompatible: ${donorBloodGroup} → ${recipientBloodGroup}`);
            } else {
              reasons.push(`Blood group compatible: ${donorBloodGroup} → ${recipientBloodGroup}`);
            }

            // Organ-specific checks
            if (recipient.required_organ === 'liver' && matchingOrganDetail.liver_fat_percentage > 35) {
              compatibilityScore -= 25;
              reasons.push(`High liver fat percentage: ${matchingOrganDetail.liver_fat_percentage}%`);
            }
          }

          return {
            recipient_user_id: recipient.user_id,
            recipient_full_name: recipient.profiles?.full_name || 'Anonymous',
            organ_type: recipient.required_organ,
            compatibility_score: compatibilityScore,
            reasons: reasons,
            blood_group: recipient.profiles?.blood_group,
            rh_factor: recipient.profiles?.rh_factor,
            registration_time: recipient.profiles?.registration_time
          };
        }).filter((match: any) => match.compatibility_score > 0)
          .sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);
      }
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          {profile.role === 'donor' ? 'Compatible Recipients' : 'Compatible Donors'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Based on your profile, here are the most compatible matches
        </p>
      </header>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-muted-foreground mb-4">
            No compatible matches found yet
          </h2>
          <p className="text-muted-foreground">
            Don&apos;t worry! New matches may become available as more people join the platform.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.slice(0, 10).map((match, index) => {
            const matchName = profile.role === 'donor' 
              ? match.recipient_full_name 
              : match.donor_full_name;
            const organType = match.organ_type;
            const compatibilityScore = Math.round(match.compatibility_score || 0);
            
            return (
              <div key={match.donor_user_id || match.recipient_user_id || index} className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Match #{index + 1}: {matchName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.role === 'donor' ? 'Needs' : 'Can donate'}: {organType}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      compatibilityScore >= 80 ? 'text-green-600' : 
                      compatibilityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {compatibilityScore}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Compatibility
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Organ:</span> {organType}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> {
                      new Date(match.registration_time || Date.now()).toLocaleDateString()
                    }
                  </div>
                </div>

                {match.reasons && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm text-foreground">Compatibility Details:</h4>
                    <ul className="text-xs space-y-1">
                      {match.reasons.map((reason: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className={`mr-2 ${reason.includes('incompatible') || reason.includes('High') ? 'text-red-500' : 'text-green-500'}`}>
                            {reason.includes('incompatible') || reason.includes('High') ? '⚠' : '✓'}
                          </span>
                          <span className="text-muted-foreground">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => alert('Contact functionality would be implemented here')}
                  >
                    Request Contact Information
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">How Matching Works</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Our system matches based on blood compatibility, organ-specific requirements, and registration priority. 
            Higher compatibility scores indicate better medical matches.
          </p>
        </div>
      </div>
    </div>
  );
}
