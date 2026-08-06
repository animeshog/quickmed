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
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/Logo";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other"];

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false); // Reset error state at start

    if (!fullName || !email || !password || !confirmPassword) {
      setError(true);
      toast({
        title: "Error",
        description: "Please fill in all the basic bits, yeah?",
      });
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      toast({
        title: "Error",
        description: "Passwords don't match, you know the drill.",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        // Remove full URL, use proxy
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          dob: dob,
          gender: gender.toLowerCase(), // Convert to lowercase
          height: Number(height), // Convert to number
          weight: Number(weight), // Convert to number
          bloodGroup: bloodGroup,
        }),
      });

      const data = await response.json();

      if (response.status == 201) {
        toast({
          title: "Account Created",
          description: "Sorted! Your account is up and running.",
        });
        localStorage.setItem("token", data.token);
        navigate("/login");
      } else {
        setError(true); // Set error state for non-201 responses
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description:
            data.message || "Failed to create account. Please try again.",
        });
      }
    } catch (error) {
      setError(true); // Set error state for network/other errors
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went belly up. Check your connection, maybe?",
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
        className="relative z-20 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl border-slate-200/70 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
          <CardHeader className="space-y-1 pb-6">
            <div className="text-center">
              <Logo className="justify-center text-slate-900 mb-4" />
              <CardTitle className="text-2xl font-bold text-center text-slate-950">
                Create an Account
              </CardTitle>
              <CardDescription className="text-center text-[#6B7280]">
                Enter your information to get started
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    required
                  />
                </div>
              </div>
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
                <Label htmlFor="password" className="text-slate-700">Password</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    required
                  />
                </div>
              </div>
              <div className="border-t border-slate-200/70 pt-4 space-y-4">
                <h3 className="font-medium text-slate-700">
                  Medical Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-slate-700">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-slate-700">Gender</Label>
                    <Select onValueChange={setGender}>
                      <SelectTrigger className="border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((genderOption) => (
                          <SelectItem
                            key={genderOption}
                            value={genderOption.toLowerCase()}
                          >
                            {genderOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-slate-700">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-slate-700">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-slate-700">Blood Group</Label>
                    <Select onValueChange={setBloodGroup}>
                      <SelectTrigger className="border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/20">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((blood) => (
                          <SelectItem key={blood} value={blood}>
                            {blood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-slate-200/70 pt-6">
            <div className="text-sm text-center text-[#6B7280]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;