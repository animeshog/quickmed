import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import AnimatedBackground from "@/components/AnimatedBackground";

const FloatingShape = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute opacity-50 blur-3xl ${className}`}
    animate={{
      y: [0, -20, 0],
      x: [0, 15, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const Index = () => {
  const navigate = useNavigate();

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden relative">
      <AnimatedBackground intensity="low" />

      {/* Reduce animation duration and movement range for shapes */}
      <motion.div
        className="absolute -left-32 -top-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12, // Increased duration for slower movement
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 12, // Increased duration for slower movement
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute left-1/4 bottom-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12, // Increased duration for slower movement
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Content Container with backdrop blur */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="fixed top-0 left-0 right-0 bg-white/50 backdrop-blur-sm border-b z-50"
        >
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Logo />
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button onClick={() => navigate("/signup")}>Get Started</Button>
            </div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 pt-32 pb-20">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.div variants={fadeIn} className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                Your Health Assistant
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 ml-2"
                >
                  Powered by AI
                </motion.span>
              </h1>
              <motion.p variants={fadeIn} className="text-xl text-gray-600">
                Get instant symptom analysis and personalized health
                recommendations
              </motion.p>
            </motion.div>

            <motion.div variants={fadeIn} className="flex justify-center pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700 text-lg"
                >
                  Try Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-blue-100/50 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </main>

        {/* Updated Footer */}
        <footer className="border-t py-8 bg-white/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>
              QuickMed provides informational services only and does not replace
              professional medical advice.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const features = [
  {
    icon: <Activity className="h-6 w-6 text-blue-600" />,
    title: "Smart Analysis",
    description: "Get instant analysis of your symptoms using advanced AI",
  },
  {
    icon: <Heart className="h-6 w-6 text-blue-600" />,
    title: "Personalized Care",
    description:
      "Receive tailored health recommendations and treatment options",
  },
  {
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    title: "Private & Secure",
    description: "Your health data is encrypted and completely confidential",
  },
];

export default Index;
