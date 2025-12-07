"use client";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, Moon, TrainFront } from "lucide-react";
import { HourlyForecast } from "@/data/types";

interface HourlyScrollProps {
  data: HourlyForecast[];
}

export default function HourlyScroll({ data }: HourlyScrollProps) {
  const getIcon = (condition: string, time: string) => {
     // Simple heuristic for night time icon
     const isNight = (time.includes("PM") && (parseInt(time) >= 7 && parseInt(time) !== 12)) || (time.includes("AM") && parseInt(time) <= 5);
     
     if (condition === "clear" || (isNight && condition === "sunny")) return <Moon className="w-8 h-8 text-indigo-400" />;
     
     switch (condition.toLowerCase()) {
       case "sunny": return <Sun className="w-8 h-8 text-yellow-500" />;
       case "rainy": return <CloudRain className="w-8 h-8 text-blue-400" />;
       case "cloudy": 
       default: return <Cloud className="w-8 h-8 text-gray-400" />;
     }
  };

  return (
    <div className="w-full overflow-x-auto py-6 scrollbar-hide">
      <div className="flex gap-4 px-4 min-w-max">
        {data.map((hour, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`relative flex flex-col items-center justify-between p-4 rounded-3xl min-w-[100px] h-40 bg-white shadow-sm border border-slate-100
             ${hour.isPeak ? "bg-blue-50/50 border-blue-200" : ""}`}
          >
             {hour.isPeak && (
                 <div className="absolute -top-3 bg-blue-500 text-white p-1.5 rounded-full shadow-md z-10" title="Peak Travel Time">
                     <TrainFront size={14} />
                 </div>
             )}
             <span className="text-sm font-semibold text-slate-400">{hour.time}</span>
             <div className="my-auto drop-shadow-sm">
                {getIcon(hour.condition, hour.time)}
             </div>
             <span className="text-xl font-bold text-slate-800">{hour.temp}°</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

