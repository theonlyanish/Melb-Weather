"use client";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { DailyForecast } from "@/data/types";

interface WeekCardsProps {
  data: DailyForecast[];
}

export default function WeekCards({ data }: WeekCardsProps) {
  const getIcon = (condition: string) => {
     switch (condition.toLowerCase()) {
       case "sunny": 
       case "hot":
          return <Sun className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />;
       case "rainy": 
          return <CloudRain className="w-8 h-8 text-sky-600 dark:text-sky-400" />;
       case "stormy":
          return <CloudLightning className="w-8 h-8 text-purple-500 dark:text-purple-400" />;
       case "cloudy": 
       default: return <Cloud className="w-8 h-8 text-slate-500 dark:text-slate-400" />;
     }
  };

  const getMoodColor = (mood: string) => {
    // Subtler, cleaner colors for designer feel
    switch (mood) {
      case "orange": return "bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 border-orange-100 dark:border-orange-900/20";
      case "blue": return "bg-sky-50/50 dark:bg-blue-900/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100/50 dark:hover:bg-blue-900/20 border-sky-100 dark:border-blue-900/20";
      case "gray": return "bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800/30";
      case "red": return "bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/20 border-red-100 dark:border-red-900/20";
      case "indigo": return "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/20";
      default: return "bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800/30";
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full">
      {data.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`flex flex-col items-center p-4 rounded-3xl cursor-pointer transition-all duration-1000 theme-slow border backdrop-blur-sm shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] ${getMoodColor(day.mood)}`}
        >
          <span className="font-bold text-lg mb-2 font-display">{day.day}</span>
          <div className="mb-3 scale-110">
             {getIcon(day.condition)}
          </div>
          <div className="flex gap-3 text-sm font-medium font-sans">
            <span className="opacity-90 font-bold">{day.high}°</span>
            <span className="opacity-50">{day.low}°</span>
          </div>
          {day.rainProb > 0 && (
            <div className="mt-3 px-3 py-1 rounded-full bg-white/60 dark:bg-black/20 text-xs font-bold backdrop-blur-sm">
              {day.rainProb}% Rain
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

