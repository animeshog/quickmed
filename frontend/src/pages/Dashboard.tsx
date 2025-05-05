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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategorizedSymptoms from "@/components/CategorizedSymptoms";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  Dialog,
  DialogContent,
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
  const [symptoms, setSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [analysisResults, setAnalysisResults] = useState({
    cause: "",
    treatment: "",
    medication: "",
    homeRemedies: "",
    fileAnalysis: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("cause");
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<string>("cause");
  const [userDetails, setUserDetails] = useState<UserInfo | null>(null);

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
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        return prev.filter((s) => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const handleAnalyzeSymptoms = async () => {
    if (allSymptoms.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one symptom",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const [causeRes, treatmentRes, medicationRes, homeRemediesRes] =
        await Promise.all([
          axios.post("/api/gemini/cause", { symptoms: allSymptoms }),
          axios.post("/api/gemini/treatment", { symptoms: allSymptoms }),
          axios.post("/api/gemini/medication", { symptoms: allSymptoms }),
          axios.post("/api/gemini/home-remedies", { symptoms: allSymptoms }),
        ]);

      const newResults: AnalysisResults = {
        cause: causeRes.data.responseText,
        treatment: treatmentRes.data.responseText,
        medication: medicationRes.data.responseText,
        homeRemedies: homeRemediesRes.data.responseText,
        fileAnalysis: "",
      };

      setAnalysisResults(newResults);
      setResults(newResults);
      setActiveResultTab("cause");

      // Save to history
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const token = localStorage.getItem("token");

      if (userData._id) {
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
        } catch (error) {
          console.error("Failed to save history:", error);
          toast({
            title: "Warning",
            description: "Analysis completed but failed to save history",
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
    if (currentSymptom.trim()) {
      setAllSymptoms([...allSymptoms, currentSymptom.trim()]);
      setCurrentSymptom("");
    }
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
      toast({
        title: "File selected",
        description: selectedFile.name,
      });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await handleAnalyzeSymptoms();
      setResults(analysisResults);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to analyze symptoms",
        variant: "destructive",
      });
    }
    setIsAnalyzing(false);
  };

  const handleDownloadResults = async () => {
    const currentDate = new Date().toLocaleDateString();

    // Format date of birth if available
    const formattedDob = userDetails?.dob
      ? new Date(userDetails.dob).toLocaleDateString()
      : "Not provided";

    const prescription = document.createElement("div");
    prescription.innerHTML = `
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="border: 2px solid #2563eb; padding: 20px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h1 style="color: #2563eb; font-size: 24px; margin: 0;">QuickMed AI Doctor</h1>
              <p style="color: #64748b; margin: 5px 0;">AI-Powered Health Assistant</p>
              <p style="margin: 5px 0;">Date: ${currentDate}</p>
            </div>
            <div style="text-align: right;">
              <img src="data:image/png;base64,..." alt="QuickMed Logo" style="width: 80px;"/>
            </div>
          </div>
          
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">
            <p><strong>Patient:</strong> ${
              userDetails?.name || "[Patient Name]"
            }</p>
            <p><strong>DOB:</strong> ${formattedDob}</p>
            <p><strong>Gender:</strong> ${
              userDetails?.gender || "[Not Provided]"
            }</p>
          </div>
          
          <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 0;">
            <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Prescribed Medications</h2>
            ${analysisResults.medication}
          </div>
          
          <div style="margin-top: 40px;">
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="margin: 5px 0;"><strong>Doctor's Signature:</strong></p>
              <div style="font-family: 'Dancing Script', cursive; font-size: 24px; color: #2563eb; margin-top: 10px;">
                QuickMed AI
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                This is an AI-generated prescription for reference only.<br>
                Please consult a healthcare professional before taking any medication.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 1,
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

  const handleFindDoctor = async () => {
    try {
      if (allSymptoms.length === 0) {
        toast({
          title: "Error",
          description: "Please add symptoms first",
          variant: "destructive",
        });
        return;
      }

      const speciality = await determineSpeciality(allSymptoms);
      const practoURL = generatePractoURL(speciality);

      // Log for debugging
      console.log("Speciality:", speciality);
      console.log("Practo URL:", practoURL);

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

  const resultTabs = [
    {
      id: "cause",
      title: "Possible Cause",
      icon: "🔍",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      content: analysisResults.cause,
    },
    {
      id: "treatment",
      title: "Treatment",
      icon: "💊",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      content: analysisResults.treatment,
    },
    {
      id: "medication",
      title: "Medication",
      icon: "💉",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      content: analysisResults.medication,
    },
    {
      id: "remedies",
      title: "Home Remedies",
      icon: "🏠",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      content: analysisResults.homeRemedies,
    },
  ].concat(
    analysisResults.fileAnalysis
      ? [
          {
            id: "fileAnalysis",
            title: "Report Analysis",
            icon: "📄",
            color: "from-teal-500 to-teal-600",
            bgColor: "bg-teal-50",
            content: analysisResults.fileAnalysis,
          },
        ]
      : []
  );

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

      <main className="container mx-auto px-4 py-8">
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

        {/* Analysis Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-900">
                Analysis Results
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadResults}
                  className="text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Quick Prescription
                </Button>
                <Button
                  onClick={handleFindDoctor}
                  className="bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  <User className="h-4 w-4 mr-1" />
                  Find Doctor
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {resultTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeResultTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveResultTab(tab.id)}
                    className={`${
                      activeResultTab === tab.id ? "bg-blue-600 text-white" : ""
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.title}
                  </Button>
                ))}
              </div>

              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {resultTabs.find((tab) => tab.id === activeResultTab)?.icon}{" "}
                    {
                      resultTabs.find((tab) => tab.id === activeResultTab)
                        ?.title
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  {typeof resultTabs.find((tab) => tab.id === activeResultTab)
                    ?.content === "string" ? (
                    <ReactMarkdown>
                      {resultTabs.find((tab) => tab.id === activeResultTab)
                        ?.content || ""}
                    </ReactMarkdown>
                  ) : (
                    <p>No content available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;