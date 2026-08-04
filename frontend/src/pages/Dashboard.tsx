import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Home,
  FileText,
  Plus,
  Search,
  MessageCircle,
  User,
  Download,
  Mail,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import CategorizedSymptoms from "@/components/CategorizedSymptoms";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import html2pdf from "html2pdf.js";
import { determineSpeciality, generatePractoURL } from "@/utils/doctorMapping";
import SpeechInput from "@/components/SpeechInput";

const followUpQuestionTemplates: { keywords: string[]; question: string }[] = [
  {
    keywords: ["fever", "chills", "sweats"],
    question: "Do you have any fever or chills?",
  },
  {
    keywords: ["cough", "breath", "wheezing", "chest", "tightness"],
    question: "Do you have any breathing difficulties or chest discomfort?",
  },
  {
    keywords: ["pain", "ache", "headache", "earache", "toothache", "stiff"],
    question: "Are you experiencing any pain? If yes, where and how intense is it?",
  },
  {
    keywords: ["nausea", "vomit", "diarrhea", "constipation", "abdominal", "heartburn", "indigestion", "appetite", "bloating"],
    question: "Have you noticed any changes in appetite, digestion, or bowel habits?",
  },
  {
    keywords: ["fatigue", "tired", "sleep", "insomnia", "dizziness", "lightheaded"],
    question: "How are your energy, sleep, and mood?",
  },
  {
    keywords: ["rash", "itch", "hives", "swelling", "redness", "dry skin"],
    question: "Do you have any rash, itching, swelling, or skin changes?",
  },
  {
    keywords: ["urination", "urinary", "painful", "blood in urine"],
    question: "Are you experiencing any changes in urination?",
  },
  {
    keywords: ["travel", "exposure", "contact", "sick"],
    question: "Have you recently traveled or been exposed to someone who is sick?",
  },
  {
    keywords: ["allergy", "asthma", "diabetes", "hypertension", "condition", "illness"],
    question: "Do you have any known allergies or prior medical conditions?",
  },
];

const getFollowUpQuestions = (symptoms: string[]) => {
  const normalizedSymptoms = symptoms.map((symptom) =>
    symptom.toLowerCase().trim()
  );
  const questions = new Set<string>();

  followUpQuestionTemplates.forEach((template) => {
    if (
      template.keywords.some((keyword) =>
        normalizedSymptoms.some((symptom) => symptom.includes(keyword))
      )
    ) {
      questions.add(template.question);
    }
  });

  if (questions.size === 0) {
    questions.add("How long have you been experiencing these symptoms?");
    questions.add("Are you currently taking any medications or supplements?");
  }

  questions.add("How long have you been experiencing these symptoms?");
  questions.add("Are you currently taking any medications or supplements?");

  return Array.from(questions).slice(0, 6);
};

const symptomCategories = {
  "General Symptoms": [
    "Fever",
    "Fatigue",
    "Chills",
    "Sweating",
    "Night sweats",
    "Unexplained weight loss",
    "Unexplained weight gain",
  ],
  "Head and Face": [
    "Headache",
    "Sore throat",
    "Runny nose",
    "Sneezing",
    "Blocked nose",
    "Toothache",
    "Gum pain",
    "Swollen glands",
    "Hoarseness",
    "Blurred vision",
    "Double vision",
    "Eye pain",
    "Earache",
    "Tinnitus (ringing in the ears)",
    "Hearing loss",
    "Changes in taste",
    "Changes in smell",
    "Dry mouth",
  ],
  "Respiratory Symptoms": [
    "Cough",
    "Shortness of breath",
    "Wheezing",
    "Tightness in chest",
    "Coughing up blood",
  ],
  "Digestive Symptoms": [
    "Nausea",
    "Diarrhea",
    "Vomiting",
    "Abdominal pain",
    "Heartburn",
    "Indigestion",
    "Loss of appetite",
    "Changes in bowel habits",
    "Constipation",
    "Bloating",
    "Gas",
    "Feeling full quickly",
    "Black, tarry stools",
  ],
  "Musculoskeletal Symptoms": [
    "Muscle pain",
    "Joint pain",
    "Back pain",
    "Leg cramps",
  ],
  "Cardiovascular Symptoms": [
    "Chest pain",
    "Palpitations",
    "Increased heart rate",
    "Increased breathing rate",
    "Swollen ankles",
  ],
  "Skin Symptoms": [
    "Skin rash",
    "Itching",
    "Hives",
    "Swelling",
    "Redness",
    "Warmth to touch",
    "Dry skin",
    "Brittle nails",
  ],
  "Neurological Symptoms": [
    "Dizziness",
    "Lightheadedness",
    "Weakness",
    "Feeling faint",
    "Tremors",
    "Numbness",
    "Tingling",
    "Feeling off-balance",
    "Clumsiness",
    "Speech difficulties",
    "Difficulty swallowing",
    "Severe headache with stiff neck",
    "Sudden weakness or numbness on one side of the body",
    "Sudden difficulty speaking or understanding speech",
    "Sudden difficulty seeing in one or both eyes",
    "Sudden dizziness or loss of balance",
  ],
  "Sleep and Mental Health": [
    "Difficulty sleeping",
    "Excessive sleepiness",
    "Feeling anxious",
    "Feeling stressed",
    "Feeling irritable",
    "Difficulty concentrating",
    "Memory problems",
    "Feeling restless",
    "Feeling down",
    "Loss of interest in activities",
    "Increased appetite",
    "Decreased appetite",
    "Feeling agitated",
    "Feeling panicky",
    "Feeling overwhelmed",
    "Feeling lonely",
    "Feeling hopeless",
    "Feeling guilty",
    "Feeling worthless",
    "Thoughts of death or suicide",
  ],
  "Urinary Symptoms": [
    "Frequent urination",
    "Painful urination",
    "Blood in urine",
  ],
  Other: [
    "Feeling hot",
    "Feeling cold",
    "Dry eyes",
    "Watery eyes",
    "Sensitivity to light",
    "Sensitivity to sound",
    "Restless legs",
    "Heartburn that wakes you up",
    "Severe abdominal pain that comes on suddenly",
    "Yellowing of the skin or eyes (jaundice)",
  ],
};

type ResultTabId =
  | "cause"
  | "treatment"
  | "medication"
  | "homeRemedies"
  | "fileAnalysis";

interface ResultTab {
  id: ResultTabId;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  content: string;
}

interface AnalysisResults {
  cause: string;
  treatment: string;
  medication: string;
  homeRemedies: string;
  fileAnalysis: string;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [reportAnalysisResults, setReportAnalysisResults] = useState<AnalysisResults | null>(null);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<ResultTabId>("cause");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userDetails, setUserDetails] = useState<UserInfo | null>(null);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([]);
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [uploadedReportText, setUploadedReportText] = useState<string>("");
  const [reportUploaded, setReportUploaded] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleSymptomToggle = (symptom: string) => {
    setAllSymptoms((prev) => {
      if (prev.includes(symptom)) {
        return prev.filter((s) => s !== symptom);
      }
      return [...prev, symptom];
    });
  };

  const handleAnalyzeSymptoms = async (
    followUpAnswersToSend: string[] = []
  ) => {
    if (allSymptoms.length === 0) {
      setErrorMessage("Please add at least one symptom.");
      toast({
        title: "Error",
        description: "Please add at least one symptom",
        variant: "destructive",
      });
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);

    try {
      const payload = {
        symptoms: allSymptoms,
        followUpAnswers: followUpAnswersToSend.filter(Boolean),
      };

      const [causeRes, treatmentRes, medicationRes, homeRemediesRes] =
        await Promise.all([
          axios.post("/api/gemini/cause", payload),
          axios.post("/api/gemini/treatment", payload),
          axios.post("/api/gemini/medication", payload),
          axios.post("/api/gemini/home-remedies", payload),
        ]);

      const newResults: AnalysisResults = {
        cause: causeRes.data.responseText || String(causeRes.data?.message || ""),
        treatment:
          treatmentRes.data.responseText || String(treatmentRes.data?.message || ""),
        medication:
          medicationRes.data.responseText || String(medicationRes.data?.message || ""),
        homeRemedies:
          homeRemediesRes.data.responseText || String(homeRemediesRes.data?.message || ""),
        fileAnalysis: results?.fileAnalysis || "",
      };

      setResults(newResults);
      setActiveResultTab("cause");

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const token = localStorage.getItem("token");

      if (userData._id && token) {
        try {
          await axios.post(
            "/api/gemini/save-history",
            {
              userId: userData._id,
              symptoms: allSymptoms,
              results: newResults,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (historyError) {
          console.error("Failed to save history:", historyError);
          toast({
            title: "Warning",
            description: "Analysis completed but failed to save history.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Analysis completed successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      setErrorMessage("Unable to analyze symptoms. Please try again.");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Unable to analyze symptoms. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    toast({
      title: "Coming Soon!",
      description: "The download report feature will be available soon.",
      variant: "default",
    });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleHomeClick = () => {
    navigate("/"); // Changed from dashboard to index
  };

  const handleAddSymptom = () => {
    const symptom = currentSymptom.trim();
    if (!symptom) {
      return;
    }

    if (allSymptoms.includes(symptom)) {
      setErrorMessage("This symptom is already added.");
      return;
    }

    setAllSymptoms((prev) => [...prev, symptom]);
    setCurrentSymptom("");
    setErrorMessage("");
  };

  const handleRemoveSymptom = (index: number) => {
    setAllSymptoms(allSymptoms.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log("Selected file:", selectedFile); // Debug log

    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      toast({ title: "Uploading report...", description: selectedFile.name });

      // Upload file to backend for text extraction only. Do NOT run analysis here.
      const formData = new FormData();
      formData.append("file", selectedFile);

      axios
        .post("/api/gemini/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((resp) => {
          if (resp.data?.success) {
            const fileText = resp.data.fileText || "";
            // Store the extracted text and mark uploaded, but do not analyze yet.
            setUploadedReportText(fileText);
            setReportUploaded(true);
            toast({ title: "Uploaded", description: "Report uploaded. Click Analyze Report to start analysis." });
          } else {
            toast({ title: "Upload failed", description: resp.data?.message || "Failed to process file", variant: "destructive" });
          }
        })
        .catch((err) => {
          console.error("Upload error:", err);
          toast({ title: "Upload error", description: "Could not upload report", variant: "destructive" });
        });
    }
  };

  const handleAnalyzeUploadedReport = async () => {
    if (!uploadedReportText) {
      toast({ title: "No report", description: "Upload a report first.", variant: "destructive" });
      return;
    }

    setIsAnalyzingReport(true);
    try {
      const resp = await axios.post("/api/gemini/analyze-upload", { fileContent: uploadedReportText });
      if (resp.data?.success) {
        const fullText = resp.data.responseText || "";
        // Keep parsed report results separate from symptom analysis results.
        const parsed = parseReportAnalysis(fullText);
        // If parsed sections are all empty, warn the user that AI did not return structured sections
        if (!parsed.cause && !parsed.treatment && !parsed.medication && !parsed.homeRemedies) {
          toast({ title: "Analysis returned no structured data", description: "The report was analyzed but no structured CAUSE/TREATMENT/MEDICATION/HOME REMEDIES sections were detected. Try re-uploading or run symptom analysis.", variant: "destructive" });
        }
        setReportAnalysisResults({
          cause: parsed.cause,
          treatment: parsed.treatment,
          medication: parsed.medication,
          homeRemedies: parsed.homeRemedies,
          fileAnalysis: fullText,
        });

        // Merge parsed report fields into results only if symptom-based values are missing.
        setResults((prev) => {
          const existing = prev || ({ cause: "", treatment: "", medication: "", homeRemedies: "", fileAnalysis: "" } as AnalysisResults);
          return {
            cause: existing.cause || parsed.cause,
            treatment: existing.treatment || parsed.treatment,
            medication: existing.medication || parsed.medication,
            homeRemedies: existing.homeRemedies || parsed.homeRemedies,
            fileAnalysis: fullText,
          } as AnalysisResults;
        });
        setActiveResultTab("fileAnalysis");
        setReportUploaded(false);
        toast({ title: "Report analyzed", description: "Report analysis is ready." });
      } else {
        toast({ title: "Analysis failed", description: resp.data?.message || "Failed to analyze report", variant: "destructive" });
      }
    } catch (err) {
      console.error("Analyze report error:", err);
      toast({ title: "Analysis error", description: "Unable to analyze report. Try again.", variant: "destructive" });
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const handleAnalyze = async () => {
    if (allSymptoms.length === 0) {
      setErrorMessage("Please add at least one symptom.");
      toast({
        title: "Error",
        description: "Please add at least one symptom",
        variant: "destructive",
      });
      return;
    }

    const questions = getFollowUpQuestions(allSymptoms);
    setFollowUpQuestions(questions);
    setFollowUpDialogOpen(true);
    setCurrentFollowUpIndex(0);
    setFollowUpAnswers(Array(questions.length).fill(""));
    setFollowUpDraft("");
  };

  const handleStoreFollowUpAnswer = (answer: string) => {
    setFollowUpDraft(answer);
    setFollowUpAnswers((prev) => {
      const next = [...prev];
      next[currentFollowUpIndex] = answer;
      return next;
    });
  };

  const handleFollowUpPrevious = () => {
    setFollowUpAnswers((prev) => {
      const next = [...prev];
      next[currentFollowUpIndex] = followUpDraft;
      return next;
    });
    const previousIndex = Math.max(0, currentFollowUpIndex - 1);
    setCurrentFollowUpIndex(previousIndex);
    setFollowUpDraft(followUpAnswers[previousIndex] || "");
  };

  const handleFollowUpNext = () => {
    if (!followUpDraft.trim()) {
      toast({
        title: "Please answer the question",
        description: "Your response helps create a more accurate analysis.",
        variant: "destructive",
      });
      return;
    }

    setFollowUpAnswers((prev) => {
      const next = [...prev];
      next[currentFollowUpIndex] = followUpDraft;
      return next;
    });

    const nextIndex = Math.min(
      followUpQuestions.length - 1,
      currentFollowUpIndex + 1
    );
    setCurrentFollowUpIndex(nextIndex);
    setFollowUpDraft(followUpAnswers[nextIndex] || "");
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpDraft.trim()) {
      toast({
        title: "Please answer the question",
        description: "Your response helps create a more accurate analysis.",
        variant: "destructive",
      });
      return;
    }

    const finalAnswers = followUpAnswers.map((answer, index) =>
      index === currentFollowUpIndex ? followUpDraft : answer
    );
    setFollowUpDialogOpen(false);
    await handleAnalyzeSymptoms(finalAnswers);
  };

  const handleFollowUpDialogOpenChange = (open: boolean) => {
    if (!open) {
      const allAnswered = followUpAnswers.every((a) => a && a.trim());
      if (!allAnswered) {
        toast({
          title: "Please complete follow-up questions",
          description: "Answer all follow-up questions before closing.",
          variant: "destructive",
        });
        setFollowUpDialogOpen(true);
        return;
      }
    }
    setFollowUpDialogOpen(open);
  };

  const handleDownloadResults = async () => {
    if (!results && !reportAnalysisResults) {
      toast({
        title: "Error",
        description: "No analysis results available to generate a prescription.",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString();
    const formattedDob = userDetails?.dob
      ? new Date(userDetails.dob).toLocaleDateString()
      : "Not provided";

    // Prefer symptom analysis results; fall back to report analysis when missing.
    const medSource = (results && results.medication) || reportAnalysisResults?.medication || "";
    const causeSource = (results && results.cause) || reportAnalysisResults?.cause || "";
    const treatmentSource = (results && results.treatment) || reportAnalysisResults?.treatment || "";
    const remediesSource = (results && results.homeRemedies) || reportAnalysisResults?.homeRemedies || "";

    // Convert sources to safe HTML blocks (preserve line breaks)
    const medHtml = String(medSource || "")
      .replace(/<br\s*\/?>(?:\s*)/gi, "\n")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    const causeHtml = String(causeSource || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    const treatmentHtml = String(treatmentSource || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");
    const remediesHtml = String(remediesSource || "")
      .replace(/\n+/g, "\n")
      .trim()
      .replace(/\n/g, "<br />");

    // Prevent creating a blank prescription when AI returned no medication/treatment/cause/remedies
    const hasAnyContent = [medSource, causeSource, treatmentSource, remediesSource].some(
      (v) => v && String(v).trim()
    );

    if (!hasAnyContent) {
      toast({ title: "No prescription data", description: "AI did not provide medication, treatment or remedies to generate a prescription.", variant: "destructive" });
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
              <div style="font-size:12px;color:#64748b;">Patient</div>
              <div style="font-weight:600;font-size:14px;color:#0f172a;">${userDetails?.name || "[Patient Name]"}</div>
            </div>
            <div>
              <div style="font-size:12px;color:#64748b;">DOB / Gender</div>
              <div style="font-weight:600;font-size:14px;color:#0f172a;">${formattedDob} · ${userDetails?.gender || "Not provided"}</div>
            </div>
          </div>

          <div style="display:flex;gap:18px;margin-top:18px;">
            <div style="flex:1;">
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

  const parseReportAnalysis = (text: string) => {
    // More robust parser:
    // - Accept headings with or without trailing colon
    // - Accept headings with inline content (e.g. "CAUSE: Viral infection")
    // - Case-insensitive matching
    const normalized = text.replace(/\r/g, "").trim();
    const lines = normalized.split(/\r?\n/);
    const headings = [
      "CAUSE",
      "TREATMENT",
      "MEDICATION",
      "HOME REMEDIES",
      "HOME-REMEDY",
      "HOME-REMEDIES",
      "SUMMARY",
    ];

    const sections: { [key: string]: string } = {};
    let current: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        // preserve blank lines inside a section
        if (current) sections[current] += "\n";
        continue;
      }

      // Match heading at line start, optionally with colon and inline content
      const m = line.match(/^\s*(CAUSE|TREATMENT|MEDICATION|HOME REMEDIES|HOME-REMEDY|HOME-REMEDIES|SUMMARY)\s*[:\-]?\s*(.*)$/i);
      if (m) {
        current = m[1].toUpperCase().trim();
        sections[current] = (m[2] || "").trim();
        continue;
      }

      if (current) {
        sections[current] = (sections[current] + "\n" + line).trim();
      }
    }

    const pick = (keys: string[]) => {
      for (const k of keys) {
        const up = k.toUpperCase();
        if (sections[up] && sections[up].trim()) return sections[up].trim();
      }
      return "";
    };

    return {
      cause: pick(["CAUSE"]),
      treatment: pick(["TREATMENT"]),
      medication: pick(["MEDICATION"]),
      homeRemedies: pick(["HOME REMEDIES", "HOME-REMEDY", "HOME-REMEDIES"]),
      summary: pick(["SUMMARY"]),
    };
  };

  const handleFindDoctor = async () => {
    if (allSymptoms.length === 0) {
      toast({
        title: "Error",
        description: "Please add symptoms first",
        variant: "destructive",
      });
      return;
    }

    try {
      const speciality = await determineSpeciality(allSymptoms);
      const practoURL = generatePractoURL(speciality);
      window.open(practoURL, "_blank");
    } catch (error) {
      console.error("Error finding doctor:", error);
      toast({
        title: "Error",
        description: "Unable to find doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resultTabs: ResultTab[] = [
    {
      id: "cause",
      title: "Possible Cause",
      icon: "🔍",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      content: results?.cause || "",
    },
    {
      id: "treatment",
      title: "Treatment",
      icon: "💊",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      content: results?.treatment || "",
    },
    {
      id: "medication",
      title: "Medication",
      icon: "💉",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      content: results?.medication || "",
    },
    {
      id: "homeRemedies",
      title: "Home Remedies",
      icon: "🏠",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      content: results?.homeRemedies || "",
    },
  ].concat(
    results?.fileAnalysis
      ? [
          {
            id: "fileAnalysis",
            title: "Report Analysis",
            icon: "📄",
            color: "from-teal-500 to-teal-600",
            bgColor: "bg-teal-50",
            content: results.fileAnalysis,
          },
        ]
      : []
  );

  const activeTab =
    resultTabs.find((tab) => tab.id === activeResultTab) || resultTabs[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <AnimatedBackground intensity="low" />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => navigate("/")}
              >
                <Home className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to QuickMed
          </h1>
          <p className="text-gray-600">
            Describe your symptoms for an AI-powered health analysis
          </p>
        </motion.div>

        {/* Main Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Symptom Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Symptom Analysis</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Enter a symptom..."
                      value={currentSymptom}
                      onChange={(e) => setCurrentSymptom(e.target.value)}
                      className="flex-1"
                    />
                    <SpeechInput
                      onTranscript={(text) => setCurrentSymptom(text)}
                    />
                  </div>
                  <Button
                    onClick={handleAddSymptom}
                    disabled={!currentSymptom.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Symptom Tags */}
                <div className="flex flex-wrap gap-2">
                  {allSymptoms.map((symptom, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {symptom}
                      <button
                        onClick={() => handleRemoveSymptom(index)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>

                {/* Add Categories Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Browse Common Symptoms
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Select Symptoms by Category</DialogTitle>
                    </DialogHeader>
                    <CategorizedSymptoms
                      categories={symptomCategories}
                      selectedSymptoms={allSymptoms}
                      onToggleSymptom={(symptom) => {
                        if (allSymptoms.includes(symptom)) {
                          handleRemoveSymptom(allSymptoms.indexOf(symptom));
                        } else {
                          setAllSymptoms([...allSymptoms, symptom]);
                        }
                      }}
                    />
                  </DialogContent>
                </Dialog>

                {/* File Upload Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-600">
                      {file ? (
                        <span className="text-blue-600 font-medium">
                          {file.name}
                        </span>
                      ) : (
                        "Upload medical report (JPEG, PNG, PDF up to 5MB)"
                      )}
                    </span>
                  </label>
                  {reportUploaded && (
                    <div className="mt-3 flex gap-2">
                                  <Button
                                    onClick={handleAnalyzeUploadedReport}
                                    className="w-full"
                                    disabled={isAnalyzingReport}
                                  >
                                    {isAnalyzingReport ? (
                                      <div className="flex items-center gap-2">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Analyzing...</span>
                                      </div>
                                    ) : (
                                      <span>Analyze Report</span>
                                    )}
                                  </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedReportText("");
                          setReportUploaded(false);
                          setFile(null);
                          toast({ title: "Cleared", description: "Uploaded report cleared." });
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || allSymptoms.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Analyze Symptoms
                    </span>
                  )}
                </Button>
                {errorMessage && (
                  <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/history")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Consultation History
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    (window.location.href = "mailto:support@quickmed.com")
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Pro Tips</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">•</span>
                  Be specific with your symptoms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">•</span>
                  Include duration of symptoms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-200">•</span>
                  Upload relevant medical reports
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <Dialog open={followUpDialogOpen} onOpenChange={handleFollowUpDialogOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Follow-up Questions</DialogTitle>
              <DialogDescription>
                Answer a few quick questions so the analysis can feel more
                like a real doctor consultation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  Question {currentFollowUpIndex + 1} of {followUpQuestions.length}
                </p>
                <p className="mt-3 text-base text-slate-900">
                  {followUpQuestions[currentFollowUpIndex] || "Answer a few quick questions to help improve the analysis."}
                </p>
              </div>

              <textarea
                value={followUpDraft}
                onChange={(e) => handleStoreFollowUpAnswer(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Type your answer here..."
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={handleFollowUpPrevious}
                disabled={currentFollowUpIndex === 0}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {currentFollowUpIndex < followUpQuestions.length - 1 ? (
                  <Button onClick={handleFollowUpNext}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleFollowUpSubmit}>
                    Submit
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Analysis Results Section */}
        {results ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Analysis Results
                </h2>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                  Your latest analysis is ready. Tap any card to open the full detailed report page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => navigate("/results", { state: { results, selectedTab: "cause" } })}
                >
                  View full report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={handleDownloadResults}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Quick Prescription
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-sm text-white"
                  onClick={handleFindDoctor}
                >
                  <User className="h-4 w-4 mr-1" />
                  Find Doctor
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {resultTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() =>
                    navigate("/results", {
                      state: { results, selectedTab: tab.id },
                    })
                  }
                  className="cursor-pointer rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 text-lg ${tab.bgColor}`}
                    >
                      {tab.icon}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      View details
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {tab.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 min-h-[72px] overflow-hidden">
                    {tab.content
                      ? `${tab.content.replace(/\n+/g, " ").slice(0, 120)}${
                          tab.content.length > 120 ? "..." : ""
                        }`
                      : "No data available yet."}
                  </p>
                  <div className="mt-4 text-sm font-medium text-sky-600">
                    Open full section →
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;