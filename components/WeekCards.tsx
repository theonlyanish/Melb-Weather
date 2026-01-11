"use client";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { DailyForecast } from "@/data/types";

interface WeekCardsProps {
  data: DailyForecast[];
}

export default function WeekCards({ data }: WeekCardsProps) {
  const getMoodColor = (mood: string) => {
    // More intuitive color scheme: Orange = sunny, Blue = rainy, Gray = cloudy
    switch (mood) {
      case "orange": return {
        bg: "bg-[hsl(25,55%,95%)] dark:bg-orange-900/10",
        text: "text-[hsl(25,55%,40%)] dark:text-orange-400",
        hover: "hover:bg-[hsl(25,55%,90%)] dark:hover:bg-orange-900/20",
        border: "border-[hsl(25,55%,90%)] dark:border-orange-900/20",
        icon: "text-[hsl(40,55%,50%)] dark:text-yellow-400"
      };
      case "blue": return {
        bg: "bg-[hsl(220,65%,96%)] dark:bg-blue-900/10",
        text: "text-[hsl(220,65%,45%)] dark:text-sky-400",
        hover: "hover:bg-[hsl(220,65%,92%)] dark:hover:bg-blue-900/20",
        border: "border-[hsl(220,65%,92%)] dark:border-blue-900/20",
        icon: "text-[hsl(220,65%,55%)] dark:text-sky-400"
      };
      case "gray": return {
        bg: "bg-[hsl(210,10%,95%)] dark:bg-slate-800/30",
        text: "text-[hsl(210,10%,40%)] dark:text-slate-400",
        hover: "hover:bg-[hsl(210,10%,90%)] dark:hover:bg-slate-800/50",
        border: "border-[hsl(210,10%,90%)] dark:border-slate-800/30",
        icon: "text-[hsl(210,10%,40%)] dark:text-slate-400"
      };
      case "red": return {
        bg: "bg-[hsl(0,55%,95%)] dark:bg-red-900/10",
        text: "text-[hsl(0,55%,40%)] dark:text-red-400",
        hover: "hover:bg-[hsl(0,55%,90%)] dark:hover:bg-red-900/20",
        border: "border-[hsl(0,55%,90%)] dark:border-red-900/20",
        icon: "text-[hsl(0,55%,50%)] dark:text-red-400"
      };
      case "indigo": return {
        bg: "bg-[hsl(240,55%,95%)] dark:bg-indigo-900/10",
        text: "text-[hsl(240,55%,40%)] dark:text-indigo-400",
        hover: "hover:bg-[hsl(240,55%,90%)] dark:hover:bg-indigo-900/20",
        border: "border-[hsl(240,55%,90%)] dark:border-indigo-900/20",
        icon: "text-[hsl(240,55%,50%)] dark:text-indigo-400"
      };
      default: return {
        bg: "bg-[hsl(210,10%,95%)] dark:bg-slate-800/30",
        text: "text-[hsl(210,10%,40%)] dark:text-slate-400",
        hover: "hover:bg-[hsl(210,10%,90%)] dark:hover:bg-slate-800/50",
        border: "border-[hsl(210,10%,90%)] dark:border-slate-800/30",
        icon: "text-[hsl(210,10%,40%)] dark:text-slate-400"
      };
    }
  };

  const getIcon = (condition: string, iconColor: string, mood: string) => {
     switch (condition.toLowerCase()) {
       case "sunny": 
       case "hot":
          return <Sun className={`w-8 h-8 ${iconColor}`} />;
       case "rainy": 
          return <CloudRain className={`w-8 h-8 ${iconColor}`} />;
       case "stormy":
          // Stormy uses a slightly darker blue to show intensity, but still matches the blue mood
          const stormIconColor = mood === "blue" ? "text-[hsl(220,65%,40%)] dark:text-sky-300" : iconColor;
          return <CloudLightning className={`w-8 h-8 ${stormIconColor}`} />;
       case "cloudy": 
       default: return <Cloud className={`w-8 h-8 ${iconColor}`} />;
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
          className={`flex flex-col items-center p-4 rounded-3xl cursor-pointer transition-all duration-500 theme-slow border backdrop-blur-sm shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)] ${getMoodColor(day.mood).bg} ${getMoodColor(day.mood).hover} ${getMoodColor(day.mood).border}`}
        >
          <span className={`font-bold text-lg mb-2 font-display ${getMoodColor(day.mood).text}`}>{day.day}</span>
          <div className="mb-3 scale-110">
             {getIcon(day.condition, getMoodColor(day.mood).icon, day.mood)}
          </div>
          <div className="flex gap-3 text-sm font-medium font-sans">
            <span className="opacity-90 font-bold">{day.high}°</span>
            <span className="opacity-50">{day.low}°</span>
          </div>
          {day.rainProb > 0 && (
            <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${day.mood === "blue" ? "bg-[hsl(220,65%,88%)] dark:bg-blue-800/30 text-[hsl(220,65%,30%)] dark:text-sky-300" : "bg-[hsl(210,10%,88%)] dark:bg-slate-700/30 text-[hsl(210,10%,30%)] dark:text-slate-300"}`}>
              {day.rainProb}% Rain
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

