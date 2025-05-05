import { HeartPulse } from "lucide-react";

const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <HeartPulse className="h-6 w-6 text-blue-600" />
    <span className="text-lg font-semibold text-gray-900">QuickMed</span>
  </div>
);

export default Logo;
