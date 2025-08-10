// src/app/about/page.tsx

import React from 'react';
import Link from 'next/link';
import { Heart, Users, Gift, ShieldHalf, Scale, Eye } from 'lucide-react';

// A reusable component for statistic cards to highlight key numbers
const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border text-center">
        <div className="flex justify-center text-primary mb-3">{icon}</div>
        <div className="text-4xl font-bold text-foreground">{value}</div>
        <p className="text-muted-foreground mt-1">{label}</p>
    </div>
);

// A reusable component for each step in the donation process
const ProcessStep = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
            {number}
        </div>
        <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-muted-foreground">{children}</p>
        </div>
    </div>
);

export default function AboutDonationPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
            {/* Page Header */}
            <header className="text-center mb-16">
                <Heart className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    The Profound Gift of Organ Donation
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Learn about the critical need for organ donors and how your decision can grant someone the ultimate gift: a second chance at life.
                </p>
            </header>

            {/* The Need for Donation Section with Statistics */}
            <section id="need" className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-8 text-foreground">A Race Against Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard value="100,000+" label="People on the Waiting List" icon={<Users size={40} />} />
                    <StatCard value="17" label="People Die Each Day Waiting" icon={<Heart size={40} />} />
                    <StatCard value="1" label="Donor Can Save Up to 8 Lives" icon={<Gift size={40} />} />
                </div>
                <p className="text-center mt-8 text-muted-foreground">*Statistics are illustrative. Replace with data from official sources like NOTTO.</p>
            </section>
            
            {/* The Donation Process Section */}
            <section id="process" className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-12 text-foreground">The VitalLink Journey: A Path of Trust</h2>
                <div className="space-y-12">
                    <ProcessStep number={1} title="Secure Registration & Consent">
                        Your journey begins by registering on VitalLink. Your consent is captured and secured as a verifiable entry on the blockchain, ensuring it is permanent and cannot be tampered with.
                    </ProcessStep>
                    <ProcessStep number={2} title="AI-Powered Medical Verification (via ABHA)">
                        With your explicit consent through the official ABHA framework, we verify your medical fitness. Our AI provides a preliminary assessment, which is then passed to a medical professional for final validation. This respects your privacy while ensuring data accuracy.
                    </ProcessStep>
                    <ProcessStep number={3} title="Fair & Transparent Matching">
                        If the time comes for donation, our system searches for a match. The allocation rules are coded into a smart contract, guaranteeing that the process is based on medical urgency, compatibility, and other fair criteria, free from bias.
                    </ProcessStep>
                    <ProcessStep number={4} title="The Gift of Life">
                        Once a match is found, medical teams are notified instantly. The carefully coordinated process of organ recovery and transplantation takes place, giving a recipient a new lease on life.
                    </ProcessStep>
                </div>
            </section>
            
            {/* Who Can Donate Section */}
            <section id="who-can-donate" className="mb-20 p-8 bg-secondary/50 rounded-lg border border-border">
                <h2 className="text-3xl font-bold text-center mb-6 text-foreground">You Have the Potential to Be a Hero</h2>
                <p className="text-center max-w-3xl mx-auto text-muted-foreground">
                    People of all ages and medical histories can be potential donors. Your decision to register is the first step. The final determination of which organs and tissues are suitable for transplantation is made by medical experts at the time of donation. Don&apos;t rule yourself out.
                </p>
                <div className="flex justify-center mt-6">
                    <Link href="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105">
                        Register Your Intent Today
                    </Link>
                </div>
            </section>
            
            {/* Our Commitment Section */}
            <section id="commitment">
                <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Our Commitment to You</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <ShieldHalf className="mx-auto h-12 w-12 text-primary" />
                        <h3 className="text-xl font-semibold mt-4 text-foreground">Unyielding Security</h3>
                        <p className="mt-2 text-muted-foreground">Your data is protected with end-to-end encryption and blockchain-level integrity checks.</p>
                    </div>
                    <div className="p-4">
                        <Scale className="mx-auto h-12 w-12 text-primary" />
                        <h3 className="text-xl font-semibold mt-4 text-foreground">Absolute Fairness</h3>
                        <p className="mt-2 text-muted-foreground">Our allocation process is governed by transparent, auditable smart contracts.</p>
                    </div>
                    <div className="p-4">
                        <Eye className="mx-auto h-12 w-12 text-primary" />
                        <h3 className="text-xl font-semibold mt-4 text-foreground">Complete Transparency</h3>
                        <p className="mt-2 text-muted-foreground">We provide clear insight into processes and policies for all stakeholders.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}