// src/components/Navbar.tsx
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

type NavbarProps = {
  userRole: 'donor' | 'admin' | 'none';
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
            {userRole === 'none' && (
              <>
                <Link href="/about" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">About Donation</Link>
                <Link href="/medical-professionals" className="text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-105">For Medical Professionals</Link>
              </>
            )}
            {/* Other roles here */}
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
             <Link href="/logout" className="text-white bg-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 hover:scale-105 hover:shadow-lg transition-all duration-200 transform">
                Sign Out
              </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;