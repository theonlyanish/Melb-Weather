"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading forecast..." }: LoadingSpinnerProps) {
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlowLoading(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-white/20 max-w-sm text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
          {slowLoading ? "Hold on, taking longer than expected..." : message}
        </p>
      </div>
    </div>
  );
}


