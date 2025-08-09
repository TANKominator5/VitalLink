// src/components/Navbar.tsx
// (Showing the full updated component for clarity)

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

// We can now have three distinct roles
type UserRole = 'donor' | 'admin' | 'none';

type NavbarProps = {
  userRole: UserRole;
};

const Navbar = ({ userRole }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold hover:scale-105 transition-transform duration-200">
            VitalLink
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {/* --- When NOT logged in --- */}
            {userRole === 'none' && (
              <>
                <Link href="/about" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">About Donation</Link>
                <Link href="/medical-professionals" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">For Medical Professionals</Link>
              </>
            )}

            {/* --- When logged in as DONOR/PATIENT --- */}
            {userRole === 'donor' && (
              <>
                <Link href="/dashboard" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">Dashboard</Link>
                <Link href="/profile" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">My Profile</Link>
                <Link href="/health-records" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">Health Records</Link>
              </>
            )}
            
            {/* Add admin links later if needed */}
            {userRole === 'admin' && (
              <>
                <Link href="/admin/dashboard" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">Admin Dashboard</Link>
                <Link href="/admin/users" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">Manage Users</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {userRole === 'none' ? (
            <>
              <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-md transition-all duration-200">
                Login
              </Link>
              <Link href="/signup" className="text-white bg-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-200 transform">
                Sign-up
              </Link>
            </>
          ) : (
             // The Sign Out button is a form that calls a server action
             <form action="/auth/sign-out" method="post">
               <button type="submit" className="text-white bg-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 hover:scale-105 hover:shadow-lg transition-all duration-200 transform">
                 Sign Out
               </button>
             </form>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;