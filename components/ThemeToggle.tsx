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
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-5 w-5 text-slate-900" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : -180, scale: theme === "dark" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        <Moon className="h-5 w-5 text-white" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

