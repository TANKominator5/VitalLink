// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/server"; // <-- Import server client

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VitalLink - Organ Donation Platform",
  description: "Bridging Hope with Trust Through Technology",
};

export default async function RootLayout({ // <-- Make the function async
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine user role from metadata, default to 'none' if not logged in or no role
  const userRole = user?.user_metadata?.role ?? 'none';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Pass the dynamic user role to the Navbar */}
          <Navbar userRole={userRole} />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}