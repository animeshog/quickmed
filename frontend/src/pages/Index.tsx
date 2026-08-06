import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  FileText,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";

const features = [
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
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#FAFBFF] text-[#111827]">
      <AnimatedBackground intensity="low" />

      <header className="relative z-20 border-b border-slate-200/70 bg-[#FAFBFF]/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Logo className="text-slate-900" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-700 hover:text-[#2563EB]" onClick={() => navigate("/login")}>Sign in</Button>
            <Button className="rounded-full bg-[#2563EB] px-5 py-2 text-white shadow-lg shadow-[#2563EB]/10 hover:bg-[#1D4ED8]" onClick={() => navigate("/signup")}>Get started</Button>
          </div>
        </div>
      </header>

      <main className="relative z-20">
        <section className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Healthcare powered by AI, built around you.
              </h1>
              <p className="mt-4 text-lg leading-7 text-[#6B7280]">
                Upload symptoms, prescriptions or lab reports and receive AI-powered medical insights in seconds.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => navigate("/dashboard")} className="rounded-full bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#2563EB]/15 hover:bg-[#1D4ED8]">Start Free Assessment</Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-lg">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#6B7280]">QuickMed Dashboard</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">AI medical summary</p>
                    </div>
                    <span className="rounded-full bg-[#E0F2FE] px-3 py-1 text-xs font-semibold text-[#2563EB]">Live</span>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm text-[#6B7280]">Uploaded prescription</p>
                      <p className="mt-2 font-semibold text-slate-950">Amoxicillin 500mg</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm text-[#6B7280]">AI extracting medicines</p>
                        <ul className="mt-2 space-y-1 text-sm text-slate-800">
                          <li>• Amoxicillin</li>
                          <li>• Paracetamol</li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm text-[#6B7280]">Confidence score</p>
                        <p className="mt-2 text-2xl font-semibold text-[#2563EB]">96%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Core features</h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="relative z-20 border-t border-slate-200/70 bg-[#FAFBFF] py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9CA3AF]">© 2026 QuickMed. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <a href="#" className="hover:text-[#2563EB]">Privacy</a>
              <a href="#" className="hover:text-[#2563EB]">Terms</a>
              <a href="#" className="hover:text-[#2563EB]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
