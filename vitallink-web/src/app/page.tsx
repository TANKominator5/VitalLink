// src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, Microscope, GanttChartSquare, ChevronDown } from 'lucide-react';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-card text-card-foreground p-6 rounded-lg border border-border transition-all hover:shadow-lg hover:-translate-y-1">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

const FaqItem = ({ question, children }: { question: string, children: React.ReactNode }) => (
  <div className="border-b border-border py-4">
    <details className="group">
      <summary className="flex justify-between items-center font-semibold cursor-pointer list-none">
        <span>{question}</span>
        <span className="transition-transform group-open:rotate-180">
          <ChevronDown />
        </span>
      </summary>
      <div className="mt-3 text-muted-foreground">
        {children}
      </div>
    </details>
  </div>
);

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-20 md:py-32 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Bridging Hope with Trust
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            VitalLink is a secure, transparent, and intelligent platform reimagining the journey of organ donation to save more lives with absolute integrity.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105">
              Register as a Donor
            </Link>
            <Link href="/how-it-works" className="border-2 border-border px-8 py-3 rounded-full font-semibold text-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Why VitalLink Section */}
      <section id="features" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">The New Standard in Organ Donation</h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
              We leverage cutting-edge technology to solve the most critical challenges in the donation process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<ShieldCheck size={24} />} title="Blockchain Trust">
              Your consent and critical data points are immutably recorded, ensuring tamper-proof verification and complete trust.
            </FeatureCard>
            <FeatureCard icon={<HeartHandshake size={24} />} title="Enhanced Transparency">
              Fair, auditable, and transparent prioritization rules mean every stakeholder has clear insight into the allocation process.
            </FeatureCard>
            <FeatureCard icon={<Microscope size={24} />} title="AI-Powered Verification">
              Seamlessly verify donor medical fitness using consent-based access to ABHA health records, analyzed intelligently.
            </FeatureCard>
            <FeatureCard icon={<GanttChartSquare size={24} />} title="Streamlined Efficiency">
              From donor matching to logistics, our unified platform dramatically reduces delays and administrative overhead.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">
              Have questions? We have answers.
            </p>
          </div>
          <FaqItem question="How does the platform verify my medical data with ABHA?">
            <p>During registration, we'll guide you through a secure, consent-based process using the official ABHA framework. You grant one-time access for our system to retrieve your health records. Our AI then performs a preliminary fitness check, which is always validated by a medical professional. Your data is never stored without permission.</p>
          </FaqItem>
          <FaqItem question="Is my personal data safe and secure on this platform?">
            <p>Absolutely. We use end-to-end encryption for all data. Your consent is recorded as a cryptographic hash on a secure blockchain, making it tamper-proof and verifiable without exposing your private information. We adhere to the strictest data privacy standards.</p>
          </FaqItem>
          <FaqItem question="How does VitalLink ensure the organ allocation process is fair?">
            <p>Fairness is at our core. Prioritization rules (based on medical urgency, compatibility, etc.) are coded into a blockchain smart contract. This makes the allocation process transparent, auditable by authorized parties, and free from manual bias.</p>
          </FaqItem>
          <FaqItem question="How will I be notified if a potential match is found?">
            <p>You and your designated medical team will receive an instant, secure notification through our mobile app and other registered communication channels, ensuring no time is lost.</p>
          </FaqItem>
        </div>
      </section>
    </div>
  );
}