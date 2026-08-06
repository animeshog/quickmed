import AnimatedBackground from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import Logo from "@/components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Validate inputs before sending
    if (!email || !password) {
      setError(true);
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in both email and password",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "/auth/login",
        {
          email: email.trim().toLowerCase(),
          password: password,
        }
      );

      const data = response.data;
      console.log("Login response:", data); // Add logging

      if (data.status === "success" && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
          })
        );
        toast({
          title: "Success",
          description: data.message || "Logged in successfully",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error details:", error.response?.data || error);
      setError(true);
      setPassword("");

      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBFF] text-[#111827]">
      <AnimatedBackground intensity="low" />

      <div className="pointer-events-none absolute left-[-10%] top-0 h-96 w-96 rounded-full bg-[#2563EB]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-[#4F46E5]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#2563EB]/10 blur-3xl" />

      <header className="relative z-20 border-b border-slate-200/70 bg-[#FAFBFF]/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <Logo className="text-slate-900" />
          <Button variant="ghost" className="text-slate-700 hover:text-[#2563EB]" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <motion.div
        className="relative z-20 flex min-h-[calc(100vh-80px)] items-center justify-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-slate-200/70 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
          <CardHeader className="space-y-1 pb-6">
            <div className="text-center">
              <Logo className="justify-center text-slate-900 mb-4" />
              <CardTitle className="text-2xl font-bold text-center text-slate-950">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-[#6B7280]">
                Enter your credentials to access your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#2563EB] hover:text-[#1D4ED8]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    required
                  />
                </div>
              </div>
              <motion.div
                animate={error ? { x: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full rounded-full bg-[#2563EB] px-6 py-3 text-white shadow-xl shadow-[#2563EB]/10 hover:bg-[#1D4ED8]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-200/70 pt-6">
            <div className="text-sm text-center text-[#6B7280]">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
