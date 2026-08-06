import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import axios from "@/lib/axios";

interface AnalysisResults {
  cause: string;
  treatment: string;
  medication: string;
  homeRemedies: string;
  fileAnalysis?: string;
}

interface Medication {
  name: string;
  brandName: string;
  company: string;
  power: string;
  dose: string;
  duration: string;
}

const parseMedicationText = (medicationText: string): Medication[] => {
  if (!medicationText) return [];
  
  console.log('=== RESULTS PAGE PARSE MEDICATION TEXT START ===');
  console.log('Results Parsing medication text:', medicationText);
  console.log('Medication text length:', medicationText.length);
  
  const medications: Medication[] = [];
  const lines = medicationText.split('\n');
  console.log('Number of lines:', lines.length);
  console.log('Lines:', lines);
  
  let currentMed: Partial<Medication> | null = null;
  let medicationIndex = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    console.log(`Processing line: "${trimmedLine}"`);
    
    // Check if this is a new medication entry - more flexible matching
    // Supports: "Medication 1:", "1.", "Medication:", "Medication #1", etc.
    if (trimmedLine.toLowerCase().startsWith('medication') || 
        trimmedLine.match(/^\d+\./) ||
        trimmedLine.match(/^med\s*\d+/i) ||
        trimmedLine.match(/^medication\s*\d+/i)) {
      console.log('Results: Found medication header:', trimmedLine);
      // Save the previous medication if it has data
      if (currentMed && (currentMed.name || currentMed.brandName || currentMed.company)) {
        console.log(`Results: Saving medication ${medicationIndex}:`, currentMed);
        medications.push(currentMed as Medication);
        medicationIndex++;
      }
      // Start a new medication
      currentMed = {};
      continue;
    }
    
    // If we haven't started a medication yet, auto-start when we see any field
    if (!currentMed) {
      const nameMatch = trimmedLine.match(/^[-\s]*name:\s*(.+)$/i);
      const brandMatch = trimmedLine.match(/^[-\s]*brand\s*name:\s*(.+)$/i);
      const companyMatch = trimmedLine.match(/^[-\s]*company:\s*(.+)$/i);
      const powerMatch = trimmedLine.match(/^[-\s]*power:\s*(.+)$/i);
      const doseMatch = trimmedLine.match(/^[-\s]*dose:\s*(.+)$/i);
      const durationMatch = trimmedLine.match(/^[-\s]*duration:\s*(.+)$/i);
      
      // Auto-start if we see any medication field
      if (nameMatch || brandMatch || companyMatch || powerMatch || doseMatch || durationMatch) {
        currentMed = {};
        console.log('Results: Auto-starting medication entry from field:', trimmedLine);
      } else {
        continue;
      }
    }
    
    // Parse key-value pairs - more flexible patterns including dash prefix
    const nameMatch = trimmedLine.match(/^[-\s]*name:\s*(.+)$/i);
    const brandMatch = trimmedLine.match(/^[-\s]*brand\s*name:\s*(.+)$/i);
    const companyMatch = trimmedLine.match(/^[-\s]*company:\s*(.+)$/i);
    const powerMatch = trimmedLine.match(/^[-\s]*power:\s*(.+)$/i);
    const doseMatch = trimmedLine.match(/^[-\s]*dose:\s*(.+)$/i);
    const durationMatch = trimmedLine.match(/^[-\s]*duration:\s*(.+)$/i);
    
    // Only set if not already set to avoid overwriting
    if (nameMatch && !currentMed.name) {
      console.log('Results: Found name:', nameMatch[1]);
      currentMed.name = nameMatch[1].trim();
    }
    if (brandMatch && !currentMed.brandName) {
      console.log('Results: Found brand:', brandMatch[1]);
      currentMed.brandName = brandMatch[1].trim();
    }
    if (companyMatch && !currentMed.company) {
      console.log('Results: Found company:', companyMatch[1]);
      currentMed.company = companyMatch[1].trim();
    }
    if (powerMatch && !currentMed.power) {
      console.log('Results: Found power:', powerMatch[1]);
      currentMed.power = powerMatch[1].trim();
    }
    if (doseMatch && !currentMed.dose) {
      console.log('Results: Found dose:', doseMatch[1]);
      currentMed.dose = doseMatch[1].trim();
    }
    if (durationMatch && !currentMed.duration) {
      console.log('Results: Found duration:', durationMatch[1]);
      currentMed.duration = durationMatch[1].trim();
    }
  }
  
  // Add the last medication if exists
  if (currentMed && (currentMed.name || currentMed.brandName || currentMed.company)) {
    console.log(`Results: Saving final medication ${medicationIndex}:`, currentMed);
    medications.push(currentMed as Medication);
    medicationIndex++;
  }
  
  console.log('Results: Total medications parsed:', medications.length);
  console.log('Results: Parsed medications array:', medications);
  console.log('=== RESULTS PAGE PARSE MEDICATION TEXT END ===');
  
  // If no structured medications were found but there's text, try to create a single medication entry
  if (medications.length === 0 && medicationText.trim()) {
    console.log('No structured medications found, creating fallback entry');
    medications.push({
      name: medicationText.trim(),
      brandName: "",
      company: "",
      power: "",
      dose: "",
      duration: ""
    });
  }
  
  return medications;
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const results = (location.state?.results || {}) as AnalysisResults;
  const selectedTab = (location.state?.selectedTab as string) || "cause";
  const locationMedications = location.state?.medications as Medication[] | undefined;
  const reportAnalysisResults = location.state?.reportAnalysisResults as AnalysisResults | undefined;
  const reportFileContent = location.state?.reportFileContent as string | undefined;

  const initialMedicationText = useMemo(() => {
    if (results.medication?.trim()) return results.medication;
    if (reportAnalysisResults?.medication?.trim()) return reportAnalysisResults.medication;
    return "";
  }, [results.medication, reportAnalysisResults?.medication]);

  const [medicationText, setMedicationText] = useState(initialMedicationText);
  const [finalMedications, setFinalMedications] = useState<Medication[]>(() => {
    if (locationMedications && locationMedications.length > 0) {
      return locationMedications;
    }
    if (initialMedicationText) {
      return parseMedicationText(initialMedicationText);
    }
    return [];
  });
  const [medicationLoading, setMedicationLoading] = useState(false);

  useEffect(() => {
    if (!reportFileContent) return;

    const hasStructuredMedsFromNav =
      (locationMedications?.length ?? 0) > 0 &&
      locationMedications!.some(
        (m) => Boolean(m.brandName || m.dose || m.duration || m.power)
      );

    if (hasStructuredMedsFromNav) return;

    let cancelled = false;

    const fetchMedicationGuidance = async () => {
      setMedicationLoading(true);
      try {
        const resp = await axios.post("/gemini/medicine-guidance", {
          fileContent: reportFileContent,
        });
        if (cancelled) return;

        if (resp.data?.success && resp.data.responseText) {
          const text = String(resp.data.responseText).trim();
          setMedicationText(text);
          setFinalMedications(parseMedicationText(text));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Medicine guidance fetch error:", error);
          toast({
            title: "Medication guidance unavailable",
            description: "Could not load medication suggestions for this report. Other sections are still available.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setMedicationLoading(false);
      }
    };

    void fetchMedicationGuidance();

    return () => {
      cancelled = true;
    };
  }, [reportFileContent, locationMedications, toast]);

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
    
    // Parse medications for table format
    const parsedMeds = finalMedications;
    
    let medHtml = "";
    if (parsedMeds.length > 0) {
      medHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Medicine</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Brand</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Company</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Power</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Dose</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${parsedMeds.map(med => `
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #374151;">${med.name}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #374151;">${med.brandName}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #374151;">${med.company}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #374151;">${med.power}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #374151;">${med.dose}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #374151;">${med.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      medHtml = String(medicationText || results.medication || "")
        .replace(/<br\s*\/?>(?:\s*)/gi, "\n")
        .replace(/\n+/g, "\n")
        .trim()
        .replace(/\n/g, "<br />");
    }
    
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
      subtitle: `Suggested medicines and how to use them safely. ${finalMedications.length > 0 ? `(${finalMedications.length} medication${finalMedications.length !== 1 ? 's' : ''} found)` : ''}`,
      icon: "💉",
      content: medicationText || results.medication,
      isMedication: true,
      medications: finalMedications,
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
                className="overflow-visible rounded-[2rem] border border-slate-200 shadow-lg"
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
                <CardContent className="bg-slate-50 px-6 py-6 text-slate-700">
                  {section.isMedication && medicationLoading ? (
                    <p className="text-sm text-slate-500">Loading medication guidance from your report…</p>
                  ) : section.isMedication && finalMedications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="font-semibold text-slate-900 min-w-[150px]">Medicine Name</TableHead>
                            <TableHead className="font-semibold text-slate-900 min-w-[120px]">Brand</TableHead>
                            <TableHead className="font-semibold text-slate-900 min-w-[120px]">Company</TableHead>
                            <TableHead className="font-semibold text-slate-900 min-w-[100px]">Power</TableHead>
                            <TableHead className="font-semibold text-slate-900 min-w-[100px]">Dose</TableHead>
                            <TableHead className="font-semibold text-slate-900 min-w-[100px]">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {finalMedications.map((med, index) => (
                            <TableRow key={index} className="border-b border-slate-200">
                              <TableCell className="font-medium text-slate-900">{med.name}</TableCell>
                              <TableCell className="text-slate-700">{med.brandName}</TableCell>
                              <TableCell className="text-slate-700">{med.company}</TableCell>
                              <TableCell className="text-slate-700">{med.power}</TableCell>
                              <TableCell className="text-slate-700">{med.dose}</TableCell>
                              <TableCell className="text-slate-700">{med.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : section.isMedication ? (
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>
                        {section.content || "No medications available yet. Please return to the dashboard and run an analysis."}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>
                        {section.content || "No recommendations available yet. Please return to the dashboard and run an analysis."}
                      </ReactMarkdown>
                    </div>
                  )}
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
