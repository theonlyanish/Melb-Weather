"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small timeout to avoid hydration mismatch
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 group"
      title="Toggle theme"
    >
      <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-amber-500" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 0 : -180, scale: theme === "dark" ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Moon className="h-4 w-4 text-blue-400" />
          </motion.div>
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-sans">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}

