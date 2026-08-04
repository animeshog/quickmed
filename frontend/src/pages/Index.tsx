import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Layers,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";

const heroFeatures = [
  "Uploaded prescription",
  "AI extracting medicines",
  "Symptom analysis",
  "Confidence score",
  "Treatment summary",
  "Medication reminders",
];

const trustedBadges = [
  { label: "HIPAA Ready", icon: ShieldCheck },
  { label: "Secure", icon: Lock },
  { label: "AI Powered", icon: Sparkles },
  { label: "Private", icon: Shield },
  { label: "99.9% Uptime", icon: CheckCircle2 },
];

const featureCards = [
  {
    title: "AI Symptom Checker",
    icon: Sparkles,
    description: "Get instant, actionable insights from your symptoms.",
  },
  {
    title: "Prescription Reader",
    icon: FileText,
    description: "Upload scripts and let AI identify medicines quickly.",
  },
  {
    title: "Medicine Information",
    icon: ClipboardList,
    description: "Understand dosage, interactions, and safe usage.",
  },
  {
    title: "Health Timeline",
    icon: Layers,
    description: "Track health history and treatment progress over time.",
  },
  {
    title: "Lab Report Analysis",
    icon: HeartPulse,
    description: "Translate lab data into practical health guidance.",
  },
  {
    title: "Personalized Recommendations",
    icon: Users,
    description: "Receive care plans tuned to your unique profile.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your report",
    description: "Share a prescription, lab result, or symptoms.",
  },
  {
    number: "02",
    title: "AI extracts medicines and symptoms",
    description: "Our engine parses key details in seconds.",
  },
  {
    number: "03",
    title: "Receive recommendations and insights",
    description: "Actionable guidance delivered in a clean report.",
  },
];

const stats = [
  { value: "25,000+", label: "Reports Analyzed" },
  { value: "98%", label: "Extraction Accuracy" },
  { value: "< 15 sec", label: "Average Processing Time" },
  { value: "100%", label: "Encrypted" },
];

const testimonials = [
  {
    name: "Dr. Amina Patel",
    role: "Primary Care Physician",
    quote: "QuickMed feels like a premium clinical assistant — fast, accurate and beautifully designed.",
    avatar: "AP",
  },
  {
    name: "Jordan Lee",
    role: "Patient",
    quote: "Upload to insights in seconds. It made managing my medication so much easier.",
    avatar: "JL",
  },
  {
    name: "Mia Chen",
    role: "Healthcare Analyst",
    quote: "The interface is clean, modern, and builds trust at first glance.",
    avatar: "MC",
  },
];

const faqItems = [
  {
    question: "How secure is my health data?",
    answer:
      "Your data is encrypted in transit and at rest, and we follow industry-standard privacy practices to keep your information safe.",
  },
  {
    question: "Can I upload lab reports and prescriptions?",
    answer:
      "Yes — QuickMed supports both documents and symptom input to provide a complete AI-powered health summary.",
  },
  {
    question: "How long does the analysis take?",
    answer:
      "Most reports are analyzed in under 15 seconds, delivering insights fast without compromising quality.",
  },
  {
    question: "Is this a replacement for a doctor?",
    answer:
      "QuickMed is designed to support your care journey but does not replace licensed medical advice. Always consult a professional for diagnosis and treatment.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBFF] text-[#111827]">
      <AnimatedBackground intensity="low" />

      <div className="pointer-events-none absolute left-[-10%] top-0 h-96 w-96 rounded-full bg-[#2563EB]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-[#4F46E5]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#2563EB]/10 blur-3xl" />

      <header className="relative z-20 border-b border-slate-200/70 bg-[#FAFBFF]/90 backdrop-blur-xl">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Logo className="text-slate-900" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-700 hover:text-[#2563EB]" onClick={() => navigate("/login")}>Sign in</Button>
            <Button className="rounded-full bg-[#2563EB] px-5 py-3 text-white shadow-xl shadow-[#2563EB]/10 hover:bg-[#1D4ED8]" onClick={() => navigate("/signup")}>Get started</Button>
          </div>
        </div>
      </header>

      <main className="relative z-20">
        <section className="container mx-auto px-6 pt-14 pb-24 lg:pb-32">
          <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-sm shadow-[#2563EB]/10 backdrop-blur-xl">
                Trusted AI healthcare, built to move quickly.
              </div>
              <h1 className="text-5xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                Healthcare powered by AI, built around you.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#6B7280] sm:text-xl">
                Upload symptoms, prescriptions or lab reports and receive AI-powered medical insights, medication summaries and personalized guidance in seconds.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button onClick={() => navigate("/dashboard")} className="rounded-full bg-[#2563EB] px-6 py-4 text-base font-semibold text-white shadow-xl shadow-[#2563EB]/15 hover:bg-[#1D4ED8]">Start Free Assessment</Button>
                <Button variant="outline" className="rounded-full border-[#2563EB] px-6 py-4 text-base font-semibold text-[#2563EB] hover:border-[#1D4ED8] hover:text-[#1D4ED8]">Watch Demo</Button>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {heroFeatures.map((item) => (
                  <div key={item} className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 text-sm text-[#6B7280] shadow-sm shadow-slate-200/50">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative mx-auto max-w-[540px] lg:max-w-none">
              <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
                <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-[#2563EB] shadow-[0_0_30px_rgba(37,99,235,0.4)]" />
                <div className="absolute left-14 top-4 h-2.5 w-2.5 rounded-full bg-[#4F46E5] shadow-[0_0_20px_rgba(79,70,229,0.25)]" />
                <div className="absolute left-24 top-4 h-2.5 w-2.5 rounded-full bg-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.2)]" />
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[#6B7280]">QuickMed Dashboard</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">AI medical summary</p>
                    </div>
                    <span className="rounded-full bg-[#E0F2FE] px-3 py-1 text-xs font-semibold text-[#2563EB]">Live</span>
                  </div>

                  <div className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-[#6B7280]">Uploaded prescription</p>
                      <p className="mt-3 font-semibold text-slate-950">Amoxicillin 500mg</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-[#6B7280]">AI extracting medicines</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-800">
                          <li>• Amoxicillin</li>
                          <li>• Paracetamol</li>
                          <li>• Vitamin D</li>
                        </ul>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                        <p className="text-sm text-[#6B7280]">Confidence score</p>
                        <p className="mt-3 text-3xl font-semibold text-[#2563EB]">96%</p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-[#6B7280]">Treatment summary</p>
                      <p className="mt-3 text-sm leading-7 text-slate-800">Continue antibiotic course, rest, and stay hydrated. Schedule a follow-up if symptoms persist.</p>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                      <p className="text-sm text-[#6B7280]">Medication reminders</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950">Morning • Afternoon • Evening</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563EB]">Trusted by</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div key={badge.label} whileHover={{ y: -4 }} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition">
                  <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-[#111827]">{badge.label}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-1">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563EB]">Core features</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">A modern AI clinical toolkit.</h2>
              <p className="mt-5 text-lg leading-8 text-[#6B7280]">Everything you need to turn medical notes, prescriptions, and lab reports into structured, actionable healthcare guidance.</p>
            </motion.div>

            <div className="lg:col-span-2 grid gap-5 md:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} whileHover={{ y: -6 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#2563EB]/10 text-[#2563EB]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-3 text-base leading-7 text-[#6B7280]">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_0.1fr_1.1fr] lg:items-center">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563EB]">How it works</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">A simple three-step care workflow.</h2>
                <p className="mt-5 text-base leading-8 text-[#6B7280]">Upload your report, let AI extract and analyze, then review the recommendations that matter most.</p>
              </motion.div>

              <div className="hidden h-full w-full justify-center lg:flex">
                <div className="h-full w-px bg-slate-200" />
              </div>

              <div className="grid gap-6">
                {steps.map((step) => (
                  <motion.div key={step.number} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: Number(step.number) * 0.05 }} className="rounded-[28px] border border-slate-200 bg-[#FAFBFF] p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#2563EB] text-white">{step.number}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="space-y-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563EB]">Dashboard preview</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">A premium AI clinical workspace.</h2>
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="overflow-hidden rounded-[40px] border border-slate-200 bg-[#111827] p-6 shadow-[0_40px_120px_rgba(15,23,42,0.18)]">
              <div className="rounded-[32px] border border-slate-800 bg-[#0F172A]/80 p-6 text-white">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Patient profile</p>
                    <h3 className="mt-2 text-2xl font-semibold">Mina Carter</h3>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 px-4 py-2 text-sm text-slate-200">Live report</div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr_0.9fr]">
                  <div className="space-y-6 rounded-[28px] bg-[#111827]/80 p-6 ring-1 ring-white/10">
                    <div className="rounded-3xl bg-[#0F172A]/90 p-4">
                      <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Extracted medicines</p>
                      <ul className="mt-4 space-y-3 text-sm text-slate-200">
                        <li>• Amoxicillin 500mg</li>
                        <li>• Ibuprofen 200mg</li>
                        <li>• Hepatin 10mg</li>
                      </ul>
                    </div>
                    <div className="rounded-3xl bg-[#0F172A]/90 p-4">
                      <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Diagnosis</p>
                      <p className="mt-3 text-lg font-semibold text-white">Upper respiratory infection</p>
                    </div>
                  </div>

                  <div className="rounded-[32px] bg-white p-6 text-slate-900 shadow-xl shadow-slate-950/10">
                    <div className="rounded-[28px] border border-slate-200 bg-[#FAFBFF] p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.32em] text-[#6B7280]">Prescription</span>
                        <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs text-[#2563EB]">PDF</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-[#6B7280]">Medication</p>
                          <p className="mt-2 font-semibold">Amoxicillin 500mg</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B7280]">Dosage</p>
                          <p className="mt-2 font-semibold">Twice daily</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B7280]">Refill</p>
                          <p className="mt-2 font-semibold">3 days</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 rounded-[28px] bg-[#111827]/80 p-6 ring-1 ring-white/10">
                    <div className="rounded-3xl bg-[#0F172A]/90 p-4">
                      <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Recommended actions</p>
                      <ul className="mt-4 space-y-3 text-sm text-slate-200">
                        <li>• Continue antibiotics</li>
                        <li>• Monitor temperature</li>
                        <li>• Rest and hydrate</li>
                      </ul>
                    </div>
                    <div className="rounded-3xl bg-[#0F172A]/90 p-4">
                      <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Next check-in</p>
                      <p className="mt-3 text-lg font-semibold text-white">24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div key={stat.label} whileHover={{ y: -6 }} className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-xl">
                <p className="text-4xl font-semibold text-[#111827]">{stat.value}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.24em] text-[#6B7280]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563EB]">Testimonials</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Trusted by doctors and patients alike.</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.name} whileHover={{ y: -6 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#2563EB]/10 text-2xl font-semibold text-[#2563EB]">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-950">{testimonial.name}</p>
                    <p className="mt-1 text-sm text-[#6B7280]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-base leading-8 text-[#374151]">“{testimonial.quote}”</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 pb-16 lg:pb-24">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563EB]">FAQ</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Questions answered clearly.</h2>
              <p className="mt-5 text-lg leading-8 text-[#6B7280]">Key details about security, report uploads, and how QuickMed fits into your care workflow.</p>
            </motion.div>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <motion.div key={item.question} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setActiveFAQ((current) => (current === item.question ? null : item.question))} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="text-lg font-semibold text-slate-950">{item.question}</span>
                    <span className="text-[#2563EB] text-2xl">{activeFAQ === item.question ? "−" : "+"}</span>
                  </button>
                  <div className={`${activeFAQ === item.question ? "max-h-96" : "max-h-0"} overflow-hidden px-6 transition-all duration-300`}>
                    <p className="pb-6 text-base leading-7 text-[#6B7280]">{item.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-slate-200/70 bg-[#FAFBFF] py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-6 border-b border-slate-200/70 pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">QuickMed</p>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#6B7280]">A premium AI healthcare experience built for clarity, trust, and speed.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
              <a href="#" className="hover:text-[#2563EB]">Privacy</a>
              <a href="#" className="hover:text-[#2563EB]">Terms</a>
              <a href="#" className="hover:text-[#2563EB]">Contact</a>
              <a href="#" className="hover:text-[#2563EB]">GitHub</a>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-[#9CA3AF]">© 2026 QuickMed. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
