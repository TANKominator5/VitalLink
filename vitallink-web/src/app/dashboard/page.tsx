// src/app/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is logged in, redirect to the login page
  if (!user) {
    return redirect('/login');
  }

  // Get the user's role from metadata
  const userRole = user.user_metadata.role;

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to Your Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your VitalLink account.
        </p>
      </header>

      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
              <User size={28} />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {user.email}
            </p>
            <span className="text-sm font-medium text-white px-2 py-1 rounded-full bg-blue-600 capitalize">
              {userRole.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-semibold text-foreground">Account Status</h3>
            <p className="text-muted-foreground mt-2">
              This is your main hub. From here, you will be able to manage your profile,
              view health record summaries, and get notifications about your status.
              More features coming soon!
            </p>
        </div>
      </div>
    </div>
  );
}