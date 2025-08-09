// src/app/medical-professionals/page.tsx

import React from 'react';
import Link from 'next/link';
import { Stethoscope, UserCheck, Search, ShieldCheck, AreaChart, Workflow, LockKeyhole } from 'lucide-react';

// Reusable component for highlighting a feature or benefit
const FeatureGridItem = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-card text-card-foreground p-6 rounded-lg border border-border flex flex-col items-start">
        <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{children}</p>
    </div>
);

// Reusable component for the "How it Works" steps
const HowItWorksStep = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <li className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border-2 border-primary text-primary">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="mt-1 text-muted-foreground text-sm">{children}</p>
        </div>
    </li>
);

export default function MedicalProfessionalsPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
            {/* Page Header */}
            <header className="text-center mb-16">
                <Stethoscope className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    A New Era of Efficiency & Trust for Healthcare Professionals
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    VitalLink is engineered to augment your workflow, providing secure, verifiable data and streamlined processes to help you save more lives.
                </p>
            </header>

            {/* Core Benefits Grid */}
            <section id="benefits" className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Empowering Your Critical Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureGridItem icon={<UserCheck size={28} />} title="Verified Donor Data">
                        Access donor profiles with medical fitness pre-verified through a consent-driven ABHA integration, reducing your administrative burden and increasing confidence in donor information.
                    </FeatureGridItem>
                    <FeatureGridItem icon={<Search size={28} />} title="Intelligent & Transparent Matching">
                        Utilize a powerful matching algorithm with transparent, objective criteria. View how matches are suggested based on medical urgency, compatibility, and geography.
                    </FeatureGridItem>
                    <FeatureGridItem icon={<ShieldCheck size={28} />} title="Immutable Audit Trails">
                        Every critical action—from data access to allocation decisions—is logged on a secure blockchain. This provides an unchangeable, verifiable audit trail for unparalleled accountability.
                    </FeatureGridItem>
                    {/* THIS is the component that had the typo */}
                    <FeatureGridItem icon={<Workflow size={28} />} title="Streamlined Recipient Management">
                        Manage your recipient waiting list on a secure, centralized dashboard. Easily update patient status and medical data with role-based access control for your entire team.
                    </FeatureGridItem>
                    <FeatureGridItem icon={<AreaChart size={28} />} title="Actionable Analytics & Reporting">
                        Generate comprehensive reports on transplant activities, success rates, and system efficiency. Gain valuable insights to optimize your processes and outcomes.
                    </FeatureGridItem>
                    <FeatureGridItem icon={<LockKeyhole size={28} />} title="Unyielding Data Security">
                        All patient and donor data is handled with the highest level of security, adhering to strict data privacy regulations, with blockchain ensuring the integrity of critical records.
                    </FeatureGridItem>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section id="how-it-works" className="mb-20 bg-secondary/50 p-8 md:p-12 rounded-lg border border-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-6">A Simplified, Secure Workflow</h2>
                        <ul className="space-y-6">
                            <HowItWorksStep icon={<UserCheck size={20} />} title="List & Manage Recipients">
                                Securely list patients awaiting transplants, uploading necessary medical documentation with a full audit trail.
                            </HowItWorksStep>
                            <HowItWorksStep icon={<Search size={20} />} title="Receive Match Alerts">
                                Get instant notifications when a potential organ becomes available, with all relevant, pre-verified donor data.
                            </HowItWorksStep>
                            <HowItWorksStep icon={<ShieldCheck size={20} />} title="Verify & Access Data">
                                Access consented donor information and verify the integrity of their medical documents using blockchain-backed hashes.
                            </HowItWorksStep>
                            <HowItWorksStep icon={<Workflow size={20} />} title="Coordinate & Track">
                                Use the communication hub to coordinate with other centers and track organ logistics with an immutable chain of custody.
                            </HowItWorksStep>
                        </ul>
                    </div>
                    {/* Placeholder for an image or diagram */}
                    <div className="hidden lg:flex items-center justify-center bg-muted/50 h-80 rounded-lg">
                        <p className="text-muted-foreground">Visual Diagram of Workflow</p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section id="cta" className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Join the Future of Transplant Coordination</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Request a demo or contact us to learn how VitalLink can be integrated with your hospital or transplant center.
                </p>
                <div className="mt-8">
                    <Link href="/contact-us" className="bg-blue-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-transform hover:scale-105">
                        Request a Demo
                    </Link>
                </div>
            </section>
        </div>
    );
}