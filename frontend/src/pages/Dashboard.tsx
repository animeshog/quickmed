import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  FileText,
  Plus,
  Search,
  MessageCircle,
  User,
  Download,
  Mail,
  Send,
  Bot,
  User2,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import CategorizedSymptoms from "@/components/CategorizedSymptoms";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import html2pdf from "html2pdf.js";
import { determineSpeciality, generatePractoURL } from "@/utils/doctorMapping";
import SpeechInput from "@/components/SpeechInput";

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
  medications?: Medication[];
}

interface AnalysisResults {
  cause: string;
  treatment: string;
  medication: string;
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
  
  console.log('=== PARSE MEDICATION TEXT START ===');
  console.log('Dashboard Parsing medication text:', medicationText);
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
      console.log('Dashboard: Found medication header:', trimmedLine);
      // Save the previous medication if it has data
      if (currentMed && (currentMed.name || currentMed.brandName || currentMed.company)) {
        console.log(`Dashboard: Saving medication ${medicationIndex}:`, currentMed);
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
        console.log('Dashboard: Auto-starting medication entry from field:', trimmedLine);
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
      console.log('Dashboard: Found name:', nameMatch[1]);
      currentMed.name = nameMatch[1].trim();
    }
    if (brandMatch && !currentMed.brandName) {
      console.log('Dashboard: Found brand:', brandMatch[1]);
      currentMed.brandName = brandMatch[1].trim();
    }
    if (companyMatch && !currentMed.company) {
      console.log('Dashboard: Found company:', companyMatch[1]);
      currentMed.company = companyMatch[1].trim();
    }
    if (powerMatch && !currentMed.power) {
      console.log('Dashboard: Found power:', powerMatch[1]);
      currentMed.power = powerMatch[1].trim();
    }
    if (doseMatch && !currentMed.dose) {
      console.log('Dashboard: Found dose:', doseMatch[1]);
      currentMed.dose = doseMatch[1].trim();
    }
    if (durationMatch && !currentMed.duration) {
      console.log('Dashboard: Found duration:', durationMatch[1]);
      currentMed.duration = durationMatch[1].trim();
    }
  }
  
  // Add the last medication if exists
  if (currentMed && (currentMed.name || currentMed.brandName || currentMed.company)) {
    console.log(`Dashboard: Saving final medication ${medicationIndex}:`, currentMed);
    medications.push(currentMed as Medication);
    medicationIndex++;
  }
  
  console.log('Dashboard: Total medications parsed:', medications.length);
  console.log('Dashboard: Parsed medications array:', medications);
  console.log('=== PARSE MEDICATION TEXT END ===');
  
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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userDetails, setUserDetails] = useState<UserInfo | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [uploadedReportText, setUploadedReportText] = useState<string>("");
  const [reportUploaded, setReportUploaded] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/auth/info");
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleAnalyzeSymptoms = async (
    followUpAnswersToSend: string[] = [],
    conversationHistoryToSend: Array<{role: 'user' | 'assistant', content: string}> = []
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
        conversationHistory: conversationHistoryToSend,
      };

      const [causeRes, treatmentRes, medicationRes, homeRemediesRes] =
        await Promise.all([
          axios.post("/gemini/cause", payload),
          axios.post("/gemini/treatment", payload),
          axios.post("/gemini/medication", payload),
          axios.post("/gemini/home-remedies", payload),
        ]);

      console.log('DASHBOARD API: Raw medication response:', medicationRes.data);
      console.log('DASHBOARD API: Medication responseText:', medicationRes.data.responseText);

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

      console.log('DASHBOARD: Complete newResults object:', newResults);
      console.log('DASHBOARD: newResults.medication text:', newResults.medication);

      setResults(newResults);

      // Parse medications for navigation and state
      const parsedMedications = parseMedicationText(newResults.medication);
      console.log('=== DASHBOARD SYMPTOM ANALYSIS STATE UPDATE ===');
      console.log('Dashboard: About to set medications state with parsedMedications:', parsedMedications);
      console.log('Dashboard: Parsed medications count:', parsedMedications.length);
      setMedications(parsedMedications);
      console.log('=== DASHBOARD SYMPTOM ANALYSIS STATE UPDATE END ===');

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const token = localStorage.getItem("token");

      if (userData._id && token) {
        try {
          await axios.post(
            "/gemini/save-history",
            {
              userId: userData._id,
              symptoms: allSymptoms,
              results: newResults,
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
      
      // Navigate to results page with analysis data
      console.log('=== DASHBOARD NAVIGATION TO RESULTS ===');
      console.log('Dashboard: Navigating with medications:', parsedMedications);
      console.log('Dashboard: Medications count being passed:', parsedMedications.length);
      navigate("/results", { state: { results: newResults, selectedTab: "cause", medications: parsedMedications, reportAnalysisResults } });
      console.log('=== DASHBOARD NAVIGATION TO RESULTS END ===');
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
      setUploadedReportText("");
      setReportUploaded(false);
      
      // Upload file to backend for text extraction only. Do NOT run analysis here.
      const formData = new FormData();
      formData.append("file", selectedFile);

      axios
        .post("/gemini/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((resp) => {
          if (resp.data?.success) {
            const fileText = resp.data.fileText || "";
            // Store the extracted text and mark uploaded, but do not analyze yet.
            setUploadedReportText(fileText);
            setReportUploaded(true);
            toast({ title: "Uploaded", description: "Report uploaded. Click Report Analysis to start analysis." });
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
      const analyzeResp = await axios.post("/gemini/analyze-upload", {
        fileContent: uploadedReportText,
      });
      console.log("DASHBOARD API: Raw file analysis response:", analyzeResp.data);

      let medicationFromGuidance = "";
      try {
        const medicineGuidanceResp = await axios.post("/gemini/medicine-guidance", {
          fileContent: uploadedReportText,
        });
        console.log("DASHBOARD API: Medicine guidance response:", medicineGuidanceResp.data);
        if (medicineGuidanceResp.data?.success && medicineGuidanceResp.data.responseText) {
          medicationFromGuidance = String(medicineGuidanceResp.data.responseText).trim();
        }
      } catch (guidanceErr) {
        console.warn("Medicine guidance request failed; Results page will retry.", guidanceErr);
        toast({
          title: "Medication guidance delayed",
          description: "Report analysis completed. Medication suggestions will load on the results page.",
        });
      }

      const resp = analyzeResp;
      if (resp.data?.success) {
        const fullText = resp.data.responseText || "";
        console.log('DASHBOARD: Full analysis text:', fullText);
        // Keep parsed report results separate from symptom analysis results.
        const parsed = parseReportAnalysis(fullText);
        parsed.medication = medicationFromGuidance || parsed.medication;
        console.log('DASHBOARD: Parsed report analysis:', parsed);
        console.log('DASHBOARD: Parsed medication text:', parsed.medication);
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

        // Merge parsed report fields into results.
        // Use report values for report upload flow, preserve symptom values if they exist.
        const existing = results || ({ cause: "", treatment: "", medication: "", homeRemedies: "", fileAnalysis: "" } as AnalysisResults);
        const updatedResults = {
          cause: parsed.cause || existing.cause,
          treatment: parsed.treatment || existing.treatment,
          medication: parsed.medication || existing.medication,
          homeRemedies: parsed.homeRemedies || existing.homeRemedies,
          fileAnalysis: fullText,
        } as AnalysisResults;
        
        console.log('DASHBOARD: Updated results medication text:', updatedResults.medication);
        setResults(updatedResults);
        setReportUploaded(false);
        toast({ title: "Report analyzed", description: "Report analysis is ready." });
        
        // Navigate to results page with report analysis data
        const parsedMedications = parseMedicationText(parsed.medication);
        console.log('=== DASHBOARD REPORT ANALYSIS STATE UPDATE ===');
        console.log('Dashboard: About to set medications state with parsedMedications:', parsedMedications);
        console.log('Dashboard: Parsed medications count:', parsedMedications.length);
        setMedications(parsedMedications);
        console.log('=== DASHBOARD REPORT ANALYSIS STATE UPDATE END ===');
        console.log('Dashboard: Medication count:', parsedMedications.length);
        console.log('Dashboard: Raw medication text:', parsed.medication);
        console.log('=== DASHBOARD REPORT ANALYSIS NAVIGATION TO RESULTS ===');
        console.log('Dashboard: Navigating with medications:', parsedMedications);
        console.log('Dashboard: Medications count being passed:', parsedMedications.length);
        navigate("/results", {
          state: {
            results: updatedResults,
            selectedTab: "fileAnalysis",
            medications: parsedMedications,
            reportFileContent: uploadedReportText,
            reportAnalysisResults: {
              cause: parsed.cause,
              treatment: parsed.treatment,
              medication: parsed.medication,
              homeRemedies: parsed.homeRemedies,
              fileAnalysis: fullText,
            },
          },
        });
        console.log('=== DASHBOARD REPORT ANALYSIS NAVIGATION TO RESULTS END ===');
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

    // Initialize chat with first AI question
    setChatMessages([
      { role: 'assistant' as const, content: `I see you're experiencing: ${allSymptoms.join(", ")}. Let me ask you a few questions to better understand your condition.` }
    ]);
    setChatDialogOpen(true);
    setIsGeneratingQuestion(true);
    setQuestionCount(0); // Reset question counter
    
    try {
      const response = await axios.post("/gemini/follow-up-question", {
        symptoms: allSymptoms,
        conversationHistory: [],
        questionCount: 0,
      });
      
      if (response.data.success) {
        if (response.data.shouldStop) {
          // AI has enough context, proceed with analysis
          setChatDialogOpen(false);
          setQuestionCount(0); // Reset question counter
          await handleAnalyzeSymptoms([], chatMessages);
        } else {
          setChatMessages(prev => [...prev, { role: 'assistant' as const, content: response.data.question }]);
          setQuestionCount(prev => prev + 1); // Increment question counter
        }
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        title: "Error",
        description: "Failed to generate follow-up question",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userAnswer = chatInput.trim();
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userAnswer }];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsGeneratingQuestion(true);

    try {
      // Get next question based on conversation history (including the latest answer)
      const response = await axios.post("/gemini/follow-up-question", {
        symptoms: allSymptoms,
        conversationHistory: updatedMessages,
        currentAnswer: userAnswer,
        questionCount: questionCount,
      });

      if (response.data.success) {
        if (response.data.shouldStop) {
          // AI has enough context, proceed with analysis
          setChatDialogOpen(false);
          setQuestionCount(0); // Reset question counter
          const userAnswers = updatedMessages
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);
          await handleAnalyzeSymptoms(userAnswers, updatedMessages);
        } else {

          setChatMessages(prev => [...prev, { role: 'assistant' as const, content: response.data.question }]);
          setQuestionCount(prev => prev + 1); // Increment question counter
        }
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        title: "Error",
        description: "Failed to generate follow-up question",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleFinishChat = async () => {
    // Extract all user answers from chat
    const userAnswers = chatMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    setChatDialogOpen(false);
    setQuestionCount(0); // Reset question counter
    await handleAnalyzeSymptoms(userAnswers, chatMessages);
  };

  const handleSkipQuestion = async () => {
    const skipAnswer = "I prefer not to answer this question.";
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: skipAnswer }];
    setChatMessages(updatedMessages);
    setIsGeneratingQuestion(true);

    try {
      const response = await axios.post("/gemini/follow-up-question", {
        symptoms: allSymptoms,
        conversationHistory: updatedMessages,
        currentAnswer: skipAnswer,
        questionCount: questionCount,
      });

      if (response.data.success) {
        if (response.data.shouldStop) {
          // AI has enough context, proceed with analysis
          setChatDialogOpen(false);
          setQuestionCount(0); // Reset question counter
          const userAnswers = updatedMessages
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);
          await handleAnalyzeSymptoms(userAnswers, updatedMessages);
        } else {

          setChatMessages(prev => [...prev, { role: 'assistant' as const, content: response.data.question }]);
          setQuestionCount(prev => prev + 1); // Increment question counter
        }
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        title: "Error",
        description: "Failed to generate follow-up question",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

    // Parse medications for table format
    const parsedMeds = parseMedicationText(medSource);
    
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
      medHtml = String(medSource || "")
        .replace(/<br\s*\/?>(?:\s*)/gi, "\n")
        .replace(/\n+/g, "\n")
        .trim()
        .replace(/\n/g, "<br />");
    }
    
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
              <h1 style="margin:0;font-size:22px;color:#2563EB;letter-spacing:0.2px;">QuickMed</h1>
              <div style="font-size:12px;color:#64748b;margin-top:4px;">Healthcare powered by AI</div>
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
      filename: `quickmed-report-${currentDate}.pdf`,
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
    // Enhanced parser to support multiple heading variations:
    // - Accept headings with or without trailing colon
    // - Accept headings with inline content (e.g. "CAUSE: Viral infection")
    // - Case-insensitive matching
    // - Supports: CAUSE, Possible Cause, TREATMENT, Treatment Plan, MEDICATION, Medication Guidance, HOME REMEDIES, HOME CARE, etc.
    const normalized = text.replace(/\r/g, "").trim();
    const lines = normalized.split(/\r?\n/);

    const sections: { [key: string]: string } = {};
    let current: string | null = null;

    // Define heading patterns and their normalized keys.
    // Supports plain headings, markdown (#/##/###), and bold (**Heading**).
    const mdPrefix = String.raw`(?:#{1,6}\s*)?(?:\*{1,2})?`;
    const mdSuffix = String.raw`(?:\*{1,2})?`;
    const headingPatterns: { [key: string]: RegExp } = {
      CAUSE: new RegExp(
        `^\\s*${mdPrefix}(POSSIBLE CAUSE|CAUSE|POSSIBLECAUSE)${mdSuffix}\\s*[:\\-]?\\s*(.*)$`,
        "i"
      ),
      TREATMENT: new RegExp(
        `^\\s*${mdPrefix}(TREATMENT PLAN|TREATMENT|TREATMENTPLAN)${mdSuffix}\\s*[:\\-]?\\s*(.*)$`,
        "i"
      ),
      MEDICATION: new RegExp(
        `^\\s*${mdPrefix}(MEDICATION GUIDANCE|MEDICATION|MEDICATIONGUIDANCE)${mdSuffix}\\s*[:\\-]?\\s*(.*)$`,
        "i"
      ),
      HOME_REMEDIES: new RegExp(
        `^\\s*${mdPrefix}(HOME CARE|HOME REMEDIES|HOME REMEDY|HOME-REMEDY|HOME-REMEDIES|HOMECARE)${mdSuffix}\\s*[:\\-]?\\s*(.*)$`,
        "i"
      ),
      SUMMARY: new RegExp(
        `^\\s*${mdPrefix}(SUMMARY)${mdSuffix}\\s*[:\\-]?\\s*(.*)$`,
        "i"
      ),
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        // preserve blank lines inside a section
        if (current) sections[current] += "\n";
        continue;
      }

      // Check if line matches any heading pattern
      let matchedKey: string | null = null;
      let inlineContent = "";
      for (const [key, pattern] of Object.entries(headingPatterns)) {
        const match = line.match(pattern);
        if (match) {
          matchedKey = key;
          // Extract inline content after heading (e.g., "CAUSE: Viral infection" -> "Viral infection")
          inlineContent = match[2] ? match[2].trim() : "";
          break;
        }
      }

      if (matchedKey) {
        current = matchedKey;
        sections[current] = inlineContent;
        continue;
      }

      if (current) {
        sections[current] = (sections[current] + "\n" + line).trim();
      }
    }

    const pick = (keys: string[]) => {
      for (const k of keys) {
        if (sections[k] && sections[k].trim()) return sections[k].trim();
      }
      return "";
    };

    return {
      cause: pick(["CAUSE"]),
      treatment: pick(["TREATMENT"]),
      medication: pick(["MEDICATION"]),
      homeRemedies: pick(["HOME_REMEDIES"]),
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

  // Use the medications state which contains the properly parsed array from analysis
  // This avoids re-parsing during render and ensures we use the complete array
  const displayMedications = medications;
  
  // Debug logging
  console.log('=== DASHBOARD RENDER STATE ===');
  console.log('Dashboard render - State medications:', medications);
  console.log('Dashboard render - State medications length:', medications.length);
  console.log('Dashboard render - State medications details:', medications.map((m, i) => `${i}: ${m.name} (brand: ${m.brandName})`));
  console.log('Dashboard render - Using state medications for display:', displayMedications);
  console.log('=== DASHBOARD RENDER STATE END ===');
  
  const resultTabs: ResultTab[] = [
    {
      id: "cause" as ResultTabId,
      title: "Possible Cause",
      icon: "🔍",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      content: results?.cause || "",
    },
    {
      id: "treatment" as ResultTabId,
      title: "Treatment",
      icon: "💊",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      content: results?.treatment || "",
    },
    {
      id: "medication" as ResultTabId,
      title: "Medication",
      icon: "💉",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      content: results?.medication || "",
      medications: displayMedications,
    },
    {
      id: "homeRemedies" as ResultTabId,
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
            id: "fileAnalysis" as ResultTabId,
            title: "Report Analysis",
            icon: "📄",
            color: "from-teal-500 to-teal-600",
            bgColor: "bg-teal-50",
            content: results.fileAnalysis,
          },
        ]
      : []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <AnimatedBackground intensity="low" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-30"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gradient-to-r from-blue-100/50 to-purple-100/50 sticky top-0 z-50 shadow-lg shadow-blue-500/5"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo className="text-slate-900" />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-xl"
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
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-white/50 shadow-xl shadow-blue-500/10">
            <h1 className="text-4xl font-bold text-slate-950 mb-3">
              Healthcare powered by AI, built around you.
            </h1>
            <p className="text-gray-600 text-lg">
              Describe your symptoms for an AI-powered health analysis
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">AI Doctor Ready • 24/7 Available</span>
            </div>
          </div>
        </motion.div>

        {/* Main Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Symptom Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Symptom Analysis</h2>
                  <p className="text-sm text-gray-500">Enter your symptoms for AI-powered diagnosis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Enter a symptom..."
                      value={currentSymptom}
                      onChange={(e) => setCurrentSymptom(e.target.value)}
                      className="flex-1 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/50"
                    />
                    <SpeechInput
                      onTranscript={(text) => setCurrentSymptom(text)}
                    />
                  </div>
                  <Button
                    onClick={handleAddSymptom}
                    disabled={!currentSymptom.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* Symptom Tags */}
                <div className="flex flex-wrap gap-2">
                  {allSymptoms.map((symptom, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-md shadow-blue-500/10 border border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
                    >
                      {symptom}
                      <button
                        onClick={() => handleRemoveSymptom(index)}
                        className="hover:text-red-500 hover:bg-red-100 rounded-full p-0.5 transition-all duration-200"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                </div>

                {/* Add Categories Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Browse Common Symptoms
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Select Symptoms by Category</DialogTitle>
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
                <div className="border-t border-gray-200/50 pt-6 mt-6">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <span className="text-gray-700 font-medium">
                        {file ? (
                          <span className="text-blue-600 font-semibold">
                            {file.name}
                          </span>
                        ) : (
                          <span>Upload medical report</span>
                        )}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, PDF up to 5MB</p>
                    </div>
                  </label>
                  {file && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 h-12 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                      onClick={() => {
                        setUploadedReportText("");
                        setReportUploaded(false);
                        setFile(null);
                        toast({ title: "Cleared", description: "Uploaded report cleared." });
                      }}
                    >
                      Clear Report
                    </Button>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || allSymptoms.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 h-14 rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 text-lg font-semibold"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Search className="h-5 w-5" />
                        Analyze Symptoms
                      </span>
                    )}
                  </Button>
                  {file && (
                    <Button
                      onClick={handleAnalyzeUploadedReport}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 text-lg font-semibold"
                      disabled={isAnalyzingReport}
                    >
                      {isAnalyzingReport ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          Analyze Report
                        </span>
                      )}
                    </Button>
                  )}
                </div>
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
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-blue-500/10 border border-white/50">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  onClick={() => navigate("/history")}
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Consultation History</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  onClick={() =>
                    (window.location.href = "mailto:support@quickmed.com")
                  }
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Contact Support</span>
                </Button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/25">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Pro Tips</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 p-1 rounded-full mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Be specific with your symptoms</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 p-1 rounded-full mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Include duration of symptoms</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/20 p-1 rounded-full mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Upload relevant medical reports</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
          <DialogContent className="max-w-2xl h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI Health Consultation
              </DialogTitle>
              <DialogDescription>
                {questionCount >= 1 
                  ? `Question ${questionCount} of 10. I'll ask only necessary questions to understand your symptoms.`
                  : "I'll ask you a few questions to better understand your symptoms. Answer as many as you'd like, then click 'Finish Analysis' when ready."
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
              {chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User2 className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isGeneratingQuestion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Type your answer..."
                  disabled={isGeneratingQuestion}
                  className="flex-1"
                />
                <Button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isGeneratingQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipQuestion}
                  disabled={isGeneratingQuestion}
                  className="text-gray-600"
                >
                  Skip this question
                </Button>
                <Button
                  onClick={handleFinishChat}
                  disabled={isGeneratingQuestion}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finish Analysis
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analysis Results Section */}
        {results ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-white/50 shadow-xl shadow-blue-500/10 mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Analysis Results
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                    Your latest analysis is ready. Tap any card to open the full detailed report page.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                    onClick={() => {
                      console.log('=== DASHBOARD VIEW FULL REPORT BUTTON CLICK ===');
                      console.log('Dashboard: View full report medications from state:', medications);
                      console.log('Dashboard: Medications count:', medications.length);
                      console.log('Dashboard: Medications details:', medications.map((m, i) => `${i}: ${m.name} (brand: ${m.brandName})`));
                      navigate("/results", { state: { results, selectedTab: "cause", medications, reportAnalysisResults } });
                      console.log('=== DASHBOARD VIEW FULL REPORT BUTTON CLICK END ===');
                    }}
                  >
                    View full report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                    onClick={handleDownloadResults}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Quick Prescription
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-10 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                    onClick={handleFindDoctor}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Find Doctor
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {resultTabs.map((tab) => (
                <motion.div
                  key={tab.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() =>
                    navigate("/results", {
                      state: { results, selectedTab: tab.id, medications: medications, reportAnalysisResults },
                    })
                  }
                  className="cursor-pointer rounded-3xl border border-white/50 bg-white/90 backdrop-blur-xl p-6 shadow-xl shadow-blue-500/10 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 text-2xl ${tab.bgColor}`}
                    >
                      {tab.icon}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                      View details
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {tab.title}
                  </h3>
                  {tab.id === "medication" && tab.medications && tab.medications.length > 0 ? (
                    <div className="mt-3 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100">
                            <TableHead className="h-8 px-2 text-[10px] font-semibold text-gray-700">Medicine</TableHead>
                            <TableHead className="h-8 px-2 text-[10px] font-semibold text-gray-700">Dose</TableHead>
                            <TableHead className="h-8 px-2 text-[10px] font-semibold text-gray-700">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tab.medications.map((med, index) => (
                            <TableRow key={index} className="border-gray-50">
                              <TableCell className="px-2 py-1 text-[10px] text-gray-600 font-medium">{med.name}</TableCell>
                              <TableCell className="px-2 py-1 text-[10px] text-gray-600">{med.dose}</TableCell>
                              <TableCell className="px-2 py-1 text-[10px] text-gray-600">{med.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-gray-600 min-h-[72px] overflow-hidden">
                      {tab.content
                        ? `${tab.content.replace(/\n+/g, " ").slice(0, 120)}${
                            tab.content.length > 120 ? "..." : ""
                          }`
                        : "No data available yet."}
                    </p>
                  )}
                  <div className="mt-4 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Open full section →
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
};

export default Dashboard;