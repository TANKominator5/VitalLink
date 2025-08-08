// src/components/Footer.tsx
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground mt-20">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">VitalLink</h2>
            <p>Bridging Hope with Trust Through Technology</p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about-us" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/news" className="hover:text-foreground">News</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="hover:text-foreground">How it works</Link></li>
              <li><Link href="/information" className="hover:text-foreground">Information</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/copyright-notice" className="hover:text-foreground">Copyright Notice</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} VitalLink. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;