import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Activity, Home, LogOut, User, Mail, Calendar, Ruler, Weight, Droplet, History as HistoryIcon } from "lucide-react";
import { motion } from "motion/react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Logo from "@/components/Logo";

interface UserData {
  _id: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  height?: number | null;
  weight?: number | null;
  bloodGroup?: string;
  createdAt: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get<UserData>("/api/auth/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile data:", response.data); // Debug log
        setUserData(response.data);
        setError("");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Failed to fetch profile");
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleBackToHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 relative overflow-hidden">
      <AnimatedBackground intensity="low" />

      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-teal-100 relative"
      >
        <div className="container mx-auto px-4 py-3">
          <Logo />
        </div>
      </motion.header>

      <main className="container max-w-3xl mx-auto px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="animate-pulse space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded-full w-3/4" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-8 rounded-lg shadow-sm border border-red-100">
              <p className="text-red-600 text-center text-lg font-medium">{error}</p>
              <Button
                onClick={() => navigate("/login")}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-gradient-to-br from-teal-50/90 to-emerald-50/90 backdrop-blur-sm rounded-lg shadow-sm border border-teal-100/50"
            >
              <div className="p-6 border-b border-teal-100/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <User className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{userData?.name}</h1>
                    <p className="text-gray-500">{userData?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard
                    icon={<Mail className="h-5 w-5 text-gray-500" />}
                    label="Email"
                    value={userData?.email}
                  />
                  <InfoCard
                    icon={<Calendar className="h-5 w-5 text-gray-500" />}
                    label="Date of Birth"
                    value={userData?.dob && new Date(userData.dob).toLocaleDateString()}
                  />
                  <InfoCard
                    icon={<User className="h-5 w-5 text-gray-500" />}
                    label="Gender"
                    value={userData?.gender}
                  />
                  <InfoCard
                    icon={<Ruler className="h-5 w-5 text-gray-500" />}
                    label="Height"
                    value={userData?.height && `${userData.height} cm`}
                  />
                  <InfoCard
                    icon={<Weight className="h-5 w-5 text-gray-500" />}
                    label="Weight"
                    value={userData?.weight && `${userData.weight} kg`}
                  />
                  <InfoCard
                    icon={<Droplet className="h-5 w-5 text-gray-500" />}
                    label="Blood Group"
                    value={userData?.bloodGroup}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white w-full"
                  >
                    <Home className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate("/history")}
                    className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white w-full"
                  >
                    <HistoryIcon className="mr-2 h-4 w-4" /> History
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="flex items-center justify-center border-gray-200 text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value?: string | number | null;
  icon: React.ReactNode;
}

const InfoCard = ({ label, value, icon }: InfoCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-teal-100 hover:border-teal-200 hover:bg-white/70 transition-all"
  >
    <div className="flex items-center gap-2 text-gray-600 mb-2">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <p className="text-gray-900 text-lg font-medium">
      {value || <span className="text-gray-400">Not specified</span>}
    </p>
  </motion.div>
);