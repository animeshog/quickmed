import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";

interface AnalysisResults {
  cause: string;
  treatment: string;
  medication: string;
  homeRemedies: string;
  fileAnalysis?: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const results = (location.state?.results || {}) as AnalysisResults;
  const selectedTab = (location.state?.selectedTab as string) || "cause";

  useEffect(() => {
    if (!results || Object.keys(results).length === 0) {
      return;
    }

    const element = document.getElementById(selectedTab);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results, selectedTab]);

  const handleDownload = async () => {
    if (!results || Object.keys(results).length === 0) {
      toast({
        title: "Error",
        description: "No analysis results available to generate a prescription.",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString();
    const medHtml = String(results.medication || "")
      .replace(/<br\s*\/?>(?:\s*)/gi, "\n")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    const causeHtml = String(results.cause || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    const treatmentHtml = String(results.treatment || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    const remediesHtml = String(results.homeRemedies || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");

    const hasAnyContent = [medHtml, causeHtml, treatmentHtml, remediesHtml].some(
      (value) => value && value.trim().length > 0
    );

    if (!hasAnyContent) {
      toast({
        title: "No prescription data",
        description: "AI did not provide enough prescription content to download.",
        variant: "destructive",
      });
      return;
    }

    const prescription = document.createElement("div");
    prescription.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #0f172a;">
        <div style="max-width: 820px; margin: 0 auto; padding: 28px; background: #ffffff;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e6eef8;padding-bottom:16px;">
            <div>
              <h1 style="margin:0;font-size:22px;color:#0ea5e9;letter-spacing:0.2px;">QuickMed</h1>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">AI-Powered Health Assistant</div>
            </div>
            <div style="text-align:right;font-size:12px;color:#475569;">Date: ${currentDate}</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;padding:12px 0;border-bottom:1px dashed #e6eef8;">
            <div>
              <h2 style="margin:0 0 8px 0;color:#0f172a;font-size:16px;">Prescribed Medications</h2>
              <div style="font-size:13px;color:#374151;line-height:1.45;">
                ${medHtml || '<span style="color:#9ca3af;">No medications suggested.</span>'}
              </div>

              <h3 style="margin:18px 0 8px 0;color:#0f172a;font-size:15px;">Treatment</h3>
              <div style="font-size:13px;color:#374151;line-height:1.45;">${treatmentHtml || '<span style="color:#9ca3af;">No treatment suggestions.</span>'}</div>

              <h3 style="margin:18px 0 8px 0;color:#0f172a;font-size:15px;">Home Remedies</h3>
              <div style="font-size:13px;color:#374151;line-height:1.45;">${remediesHtml || '<span style="color:#9ca3af;">No home remedies suggested.</span>'}</div>
            </div>

            <div style="width:260px;">
              <div style="background:#f8fafc;border-radius:12px;padding:12px;border:1px solid #eef2f7;">
                <div style="font-size:13px;color:#6b7280;font-weight:600;">Possible Cause</div>
                <div style="margin-top:8px;font-size:13px;color:#374151;line-height:1.4;">${causeHtml || '<span style="color:#9ca3af;">No cause determined.</span>'}</div>
              </div>

              <div style="margin-top:14px;background:linear-gradient(180deg,#eef8ff,#ffffff);border-radius:12px;padding:12px;border:1px solid #e6f0fb;">
                <div style="font-size:12px;color:#0ea5e9;font-weight:700;">Disclaimer</div>
                <div style="margin-top:8px;font-size:11px;color:#64748b;">This is an AI-generated prescription intended for reference only. Consult a qualified healthcare professional before starting any medication.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 8,
      filename: `quickmed-prescription-${currentDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(prescription).save();
      toast({
        title: "Success",
        description: "Prescription downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download prescription",
        variant: "destructive",
      });
    }
  };

  const sections = [
    {
      id: "cause",
      title: "Possible Cause",
      subtitle: "What may be contributing to your symptoms.",
      icon: "🔍",
      content: results.cause,
    },
    {
      id: "treatment",
      title: "Treatment Plan",
      subtitle: "Recommended next steps and care guidance.",
      icon: "💊",
      content: results.treatment,
    },
    {
      id: "medication",
      title: "Medication Guidance",
      subtitle: "Suggested medicines and how to use them safely.",
      icon: "💉",
      content: results.medication,
    },
    {
      id: "homeRemedies",
      title: "Home Care",
      subtitle: "Safe remedies and lifestyle adjustments.",
      icon: "🏠",
      content: results.homeRemedies,
    },
  ];

  const summaryText =
    results.fileAnalysis ||
    results.cause ||
    "Your report summary will appear here once the analysis is complete.";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-950 via-sky-900 to-cyan-700 px-6 py-10 text-white">
        <div className="container mx-auto flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Detailed Results</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Clinical report — organized, clear, and professional.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200/90">
              View your diagnosis summary, treatment direction, medication guidance, and safe home care recommendations in one polished report.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              className="bg-white text-slate-950 hover:bg-slate-100"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Prescription
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.55fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/30">
              <CardHeader className="bg-white/90 px-6 py-6">
                <CardTitle className="text-2xl font-semibold text-slate-950">
                  Full analysis overview
                </CardTitle>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This section highlights the most important findings from your latest analysis.
                </p>
              </CardHeader>
              <CardContent className="bg-slate-50 px-6 py-6">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Report summary</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-600 whitespace-pre-line">
                    {summaryText}
                  </p>
                </div>
              </CardContent>
            </Card>

            {sections.map((section) => (
              <Card
                key={section.id}
                id={section.id}
                className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-lg"
              >
                <CardHeader className="grid gap-3 bg-white px-6 py-6 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{section.subtitle}</p>
                  </div>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none bg-slate-50 px-6 py-6 text-slate-700">
                  <ReactMarkdown>
                    {section.content || "No recommendations available yet. Please return to the dashboard and run an analysis."}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            ))}
          </div>

          <aside className="space-y-6">
            <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-lg font-semibold text-slate-950">Jump to section</CardTitle>
                <p className="mt-2 text-sm text-slate-500">
                  Select a card in the dashboard to open a specific section directly.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 px-6 py-6">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      const element = document.getElementById(section.id);
                      element?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    <span className="block font-semibold text-slate-900">{section.title}</span>
                    <span className="text-slate-500">{section.subtitle}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-xl">
              <CardContent className="px-6 py-6">
                <h2 className="text-lg font-semibold">Important note</h2>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  QuickMed results are intended as guidance only. Always consult a licensed healthcare professional before acting on medical advice.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Results;
