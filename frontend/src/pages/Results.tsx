import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

interface AnalysisResults {
  cause: string;
  treatment: string;
  medication: string;
  homeRemedies: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const results = (location.state?.results || {}) as AnalysisResults;

  const handleDownload = () => {
    toast({
      title: "Coming Soon!",
      description: "The download feature will be available soon.",
      variant: "default",
    });
  };

  const sections = [
    { title: "Possible Cause", content: results.cause, icon: "🔍" },
    { title: "Treatment Plan", content: results.treatment, icon: "💊" },
    {
      title: "Recommended Medication",
      content: results.medication,
      icon: "💉",
    },
    { title: "Home Remedies", content: results.homeRemedies, icon: "🏠" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <h1 className="text-2xl font-bold">Health Analysis Report</h1>
            <p className="text-indigo-100">
              Detailed assessment of your symptoms
            </p>
          </div>

          <div className="p-6 space-y-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.title}
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <ReactMarkdown>
                    {section.content || "*No data available*"}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Results;
