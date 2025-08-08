// src/components/Navbar.tsx
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

type NavbarProps = {
  userRole: 'donor' | 'admin' | 'none';
};

const Navbar = ({ userRole }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          VitalLink
        </Link>
        
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {userRole === 'none' && (
            <>
              <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About Donation</Link>
              <Link href="/medical-professionals" className="text-muted-foreground transition-colors hover:text-foreground">For Medical Professionals</Link>
            </>
          )}
          {/* Other roles here */}
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {userRole === 'none' ? (
            <>
              <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                Login
              </Link>
              <Link href="/signup" className="text-white bg-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Sign-up
              </Link>
            </>
          ) : (
             <Link href="/logout" className="text-white bg-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                Sign Out
              </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;