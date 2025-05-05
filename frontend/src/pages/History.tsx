import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  PlusCircle,
  Pill,
  Stethoscope,
  Home as HomeIcon,
} from "lucide-react";
import axios from "axios";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";

interface ChatHistory {
  _id: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  recommendations: string;
  homeRemedies?: string;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/chat-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
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

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
                <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {chat.symptoms.slice(0, 3).join(", ")}
                          {chat.symptoms.length > 3 && "..."}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
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
    </div>
  );
};

export default History;
