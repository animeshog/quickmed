import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  PlusCircle,
  Pill,
  Stethoscope,
  Home as HomeIcon,
  Download,
  X,
  FileText,
  Activity,
  Syringe,
  Leaf,
} from "lucide-react";
import axios from "@/lib/axios";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";
import html2pdf from "html2pdf.js";

interface ChatHistory {
  _id: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: string;
  homeRemedies: string;
  fileAnalysis: string;
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
  
  const medications: Medication[] = [];
  const lines = medicationText.split('\n');
  let currentMed: Partial<Medication> | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this is a new medication entry - more flexible matching
    if (trimmedLine.toLowerCase().startsWith('medication') || 
        trimmedLine.match(/^\d+\./) ||
        trimmedLine.match(/^med\s*\d+/i)) {
      // Save the previous medication if it has data
      if (currentMed && (currentMed.name || currentMed.brandName || currentMed.company)) {
        medications.push(currentMed as Medication);
      }
      // Start a new medication
      currentMed = {};
      continue;
    }
    
    // If we haven't started a medication yet, try to detect if this line starts medication data
    if (!currentMed) {
      const nameMatch = trimmedLine.match(/^[-\s]*name:\s*(.+)$/i);
      const brandMatch = trimmedLine.match(/^[-\s]*brand\s*name:\s*(.+)$/i);
      if (nameMatch || brandMatch) {
        currentMed = {};
      } else {
        continue;
      }
    }
    
    // Parse key-value pairs - more flexible patterns
    const nameMatch = trimmedLine.match(/^[-\s]*name:\s*(.+)$/i);
    const brandMatch = trimmedLine.match(/^[-\s]*brand\s*name:\s*(.+)$/i);
    const companyMatch = trimmedLine.match(/^[-\s]*company:\s*(.+)$/i);
    const powerMatch = trimmedLine.match(/^[-\s]*power:\s*(.+)$/i);
    const doseMatch = trimmedLine.match(/^[-\s]*dose:\s*(.+)$/i);
    const durationMatch = trimmedLine.match(/^[-\s]*duration:\s*(.+)$/i);
    
    // Only set if not already set to avoid overwriting
    if (nameMatch && !currentMed.name) currentMed.name = nameMatch[1].trim();
    if (brandMatch && !currentMed.brandName) currentMed.brandName = brandMatch[1].trim();
    if (companyMatch && !currentMed.company) currentMed.company = companyMatch[1].trim();
    if (powerMatch && !currentMed.power) currentMed.power = powerMatch[1].trim();
    if (doseMatch && !currentMed.dose) currentMed.dose = doseMatch[1].trim();
    if (durationMatch && !currentMed.duration) currentMed.duration = durationMatch[1].trim();
  }
  
  // Add the last medication if exists
  if (currentMed && (currentMed.name || currentMed.brandName || currentMed.company)) {
    medications.push(currentMed as Medication);
  }
  
  return medications;
};

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<ChatHistory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/auth/chat-history");
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const downloadPrescription = async (chat: ChatHistory) => {
    const currentDate = new Date(chat.date).toLocaleDateString();
    
    // Parse medications for table format
    const parsedMeds = parseMedicationText(chat.medications || "");
    
    // Format symptoms for display
    const symptomsHtml = chat.symptoms.map(s => `<span style="display:inline-block;margin:4px;padding:4px 8px;background:#dbeafe;color:#1e40af;border-radius:12px;font-size:11px;">${s}</span>`).join('');
    
    // Format medications as table or plain text
    let medHtml = "";
    if (parsedMeds.length > 0) {
      medHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Medicine</th>
              <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Brand</th>
              <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Company</th>
              <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Power</th>
              <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Dose</th>
              <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left; font-size: 11px; font-weight: 600; color: #475569;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${parsedMeds.map(med => `
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 11px; color: #374151;">${med.name}</td>
                <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 11px; color: #374151;">${med.brandName}</td>
                <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 11px; color: #374151;">${med.company}</td>
                <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 11px; color: #374151;">${med.power}</td>
                <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 11px; color: #374151;">${med.dose}</td>
                <td style="border: 1px solid #e2e8f0; padding: 6px; font-size: 11px; color: #374151;">${med.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      medHtml = String(chat.medications || "")
        .replace(/\n+/g, "\n")
        .trim()
        .replace(/\n/g, "<br />");
    }
    
    // Format treatment for display
    const treatmentHtml = String(chat.treatment || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    
    // Format home remedies for display
    const remediesHtml = String(chat.homeRemedies || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    
    // Format file analysis for display
    const fileAnalysisHtml = String(chat.fileAnalysis || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");

    const hasAnyContent = [medHtml, treatmentHtml, remediesHtml, fileAnalysisHtml].some(
      (value) => value && value.trim().length > 0
    );

    if (!hasAnyContent) {
      toast({
        title: "No prescription data",
        description: "No prescription content available to download.",
        variant: "destructive",
      });
      return;
    }

    const prescription = document.createElement("div");
    prescription.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #0f172a;">
        <div style="max-width: 750px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e6eef8;padding-bottom:12px;">
            <div>
              <h1 style="margin:0;font-size:20px;color:#0ea5e9;letter-spacing:0.2px;">QuickMed</h1>
              <div style="font-size:11px;color:#64748b;margin-top:2px;">AI-Powered Health Assistant</div>
            </div>
            <div style="text-align:right;font-size:11px;color:#475569;">Date: ${currentDate}</div>
          </div>

          <div style="margin-top:12px;padding:8px 0;border-bottom:1px dashed #e6eef8;">
            <h2 style="margin:0 0 6px 0;color:#0f172a;font-size:14px;">Symptoms</h2>
            <div style="font-size:11px;color:#374151;line-height:1.3;">${symptomsHtml || '<span style="color:#9ca3af;">No symptoms recorded.</span>'}</div>
          </div>

          <div style="margin-top:12px;padding:8px 0;border-bottom:1px dashed #e6eef8;">
            <h2 style="margin:0 0 6px 0;color:#0f172a;font-size:14px;">Diagnosis</h2>
            <div style="font-size:11px;color:#374151;line-height:1.3;">${chat.diagnosis || '<span style="color:#9ca3af;">No diagnosis recorded.</span>'}</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;padding:8px 0;border-bottom:1px dashed #e6eef8;">
            <div>
              <h2 style="margin:0 0 6px 0;color:#0f172a;font-size:14px;">Prescribed Medications</h2>
              <div style="font-size:11px;color:#374151;line-height:1.3;">
                ${medHtml || '<span style="color:#9ca3af;">No medications suggested.</span>'}
              </div>

              <h3 style="margin:12px 0 6px 0;color:#0f172a;font-size:13px;">Treatment</h3>
              <div style="font-size:11px;color:#374151;line-height:1.3;">${treatmentHtml || '<span style="color:#9ca3af;">No treatment suggestions.</span>'}</div>

              <h3 style="margin:12px 0 6px 0;color:#0f172a;font-size:13px;">Home Remedies</h3>
              <div style="font-size:11px;color:#374151;line-height:1.3;">${remediesHtml || '<span style="color:#9ca3af;">No home remedies suggested.</span>'}</div>
              
              ${fileAnalysisHtml ? `
                <h3 style="margin:12px 0 6px 0;color:#0f172a;font-size:13px;">File Analysis</h3>
                <div style="font-size:11px;color:#374151;line-height:1.3;">${fileAnalysisHtml}</div>
              ` : ''}
            </div>

            <div style="width:220px;">
              <div style="background:#f8fafc;border-radius:8px;padding:10px;border:1px solid #eef2f7;">
                <div style="font-size:11px;color:#6b7280;font-weight:600;">Consultation Notes</div>
                <div style="margin-top:6px;font-size:10px;color:#374151;line-height:1.3;">This prescription is based on the symptoms and diagnosis provided during your consultation.</div>
              </div>

              <div style="margin-top:10px;background:linear-gradient(180deg,#eef8ff,#ffffff);border-radius:8px;padding:10px;border:1px solid #e6f0fb;">
                <div style="font-size:10px;color:#0ea5e9;font-weight:700;">Disclaimer</div>
                <div style="margin-top:6px;font-size:9px;color:#64748b;">This is an AI-generated prescription intended for reference only. Consult a qualified healthcare professional before starting any medication.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 5,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <AnimatedBackground intensity="low" />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
      >
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Logo />
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Past Consultations
          </h1>
          <p className="text-gray-600">Your recent health analyses</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors cursor-pointer hover:shadow-md"
                  onClick={() => {
                    setSelectedHistory(chat);
                    setIsDialogOpen(true);
                  }}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="shrink-0 bg-blue-100 p-2 rounded-lg">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="min-w-0 break-words text-sm font-medium sm:text-base">
                          {chat.symptoms.slice(0, 3).join(", ")}
                          {chat.symptoms.length > 3 && "..."}
                        </span>
                      </div>
                      <div className="shrink-0 text-xs text-gray-500 sm:text-sm">
                        {new Date(chat.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {chat.diagnosis}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Consultation Details</DialogTitle>
            <DialogDescription>
              {new Date(selectedHistory?.date || "").toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-6 mt-4">
              {/* Symptoms Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h3>Symptoms</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedHistory.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Diagnosis Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <h3>Diagnosis</h3>
                </div>
                <p className="break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:p-4 sm:text-base">
                  {selectedHistory.diagnosis}
                </p>
              </div>

              {/* Treatment Section */}
              {selectedHistory.treatment && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3>Treatment Plan</h3>
                  </div>
                  <p className="whitespace-pre-line break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:p-4 sm:text-base">
                    {selectedHistory.treatment}
                  </p>
                </div>
              )}

              {/* Medications Section */}
              {selectedHistory.medications && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Pill className="h-5 w-5 text-red-600" />
                    <h3>Medications</h3>
                  </div>
                  <p className="whitespace-pre-line break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:p-4 sm:text-base">
                    {selectedHistory.medications}
                  </p>
                </div>
              )}

              {/* Home Remedies Section */}
              {selectedHistory.homeRemedies && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <h3>Home Remedies</h3>
                  </div>
                  <p className="whitespace-pre-line break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:p-4 sm:text-base">
                    {selectedHistory.homeRemedies}
                  </p>
                </div>
              )}

              {/* File Analysis Section */}
              {selectedHistory.fileAnalysis && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <h3>File Analysis</h3>
                  </div>
                  <p className="whitespace-pre-line break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:p-4 sm:text-base">
                    {selectedHistory.fileAnalysis}
                  </p>
                </div>
              )}

              {/* Download Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => downloadPrescription(selectedHistory)}
                  className="flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Download Prescription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
