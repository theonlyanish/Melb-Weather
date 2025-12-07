"use client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface SuburbSelectorProps {
  suburbs: string[];
  selectedSuburb: string;
  onSelect: (suburb: string) => void;
}

export default function SuburbSelector({ suburbs, selectedSuburb, onSelect }: SuburbSelectorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide px-4"
    >
      <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
      {suburbs.map((suburb) => (
        <button
          key={suburb}
          onClick={() => onSelect(suburb)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-1000 theme-slow whitespace-nowrap ${
            selectedSuburb === suburb
              ? "bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105"
              : "bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 hover:text-black dark:hover:text-white"
          }`}
        >
          {suburb}
        </button>
      ))}
    </motion.div>
  );
}

