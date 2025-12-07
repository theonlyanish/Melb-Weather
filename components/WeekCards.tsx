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
          return <Sun className="w-8 h-8" />;
       case "rainy": 
          return <CloudRain className="w-8 h-8" />;
       case "stormy":
          return <CloudLightning className="w-8 h-8" />;
       case "cloudy": 
       default: return <Cloud className="w-8 h-8" />;
     }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "orange": return "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100";
      case "blue": return "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100";
      case "gray": return "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100";
      case "red": return "bg-red-50 text-red-600 hover:bg-red-100 border-red-100";
      case "indigo": return "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100";
      default: return "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100";
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
          className={`flex flex-col items-center p-4 rounded-3xl cursor-pointer transition-all duration-300 border ${getMoodColor(day.mood)} shadow-sm`}
        >
          <span className="font-bold text-lg mb-2">{day.day}</span>
          <div className="mb-3">
             {getIcon(day.condition)}
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <span className="opacity-90 font-bold">{day.high}°</span>
            <span className="opacity-50">{day.low}°</span>
          </div>
          {day.rainProb > 0 && (
            <div className="mt-3 px-3 py-1 rounded-full bg-white/60 text-xs font-bold backdrop-blur-sm">
              {day.rainProb}% Rain
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

