import { HeartPulse, Activity } from "lucide-react";
import { motion } from "motion/react";

const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] opacity-20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] shadow-lg shadow-[#2563EB]/30">
        <HeartPulse className="h-5 w-5 text-white" />
      </div>
      <motion.div
        className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[#22C55E] shadow-md"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Activity className="h-2.5 w-2.5 text-white" />
      </motion.div>
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-bold bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#2563EB] bg-clip-text text-transparent">
        QuickMed
      </span>
      <span className="text-xs font-medium text-[#6B7280] tracking-wider uppercase">
        Healthcare AI
      </span>
    </div>
  </div>
);

export default Logo;
