"use client";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, Moon, TrainFront } from "lucide-react";
import { HourlyForecast } from "@/data/types";
import { memo } from "react";

interface HourlyScrollProps {
  data: HourlyForecast[];
}

const getIcon = (condition: string, time: string) => {
  const isNight = (time.includes("PM") && (parseInt(time) >= 7 && parseInt(time) !== 12)) || (time.includes("AM") && parseInt(time) <= 5);
  
  if (condition === "clear" || (isNight && condition === "sunny")) return <Moon className="w-8 h-8 text-indigo-400" />;
  
  switch (condition.toLowerCase()) {
    case "sunny": return <Sun className="w-8 h-8 text-yellow-500" />;
    case "rainy": return <CloudRain className="w-8 h-8 text-blue-400" />;
    case "cloudy": 
    default: return <Cloud className="w-8 h-8 text-gray-400" />;
  }
};

// Memoized card to prevent re-renders
const HourCard = memo(function HourCard({ hour, index }: { hour: HourlyForecast; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }} // Cap delay for faster perceived load
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative flex flex-col items-center justify-between p-4 rounded-3xl min-w-[100px] h-40 
       border will-change-transform
       dark:border-white/10 dark:hover:bg-white/10
       ${hour.isPeak 
          ? "bg-blue-50/70 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-400/20" 
          : "bg-white/60 dark:bg-white/5 border-white/40"}`}
    >
       {hour.isPeak && (
           <div className="absolute -top-3 bg-blue-500 text-white p-1.5 rounded-full shadow-md z-10" title="Peak Travel Time">
               <TrainFront size={14} />
           </div>
       )}
       <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">{hour.time}</span>
       <div className="my-auto drop-shadow-sm scale-110">
          {getIcon(hour.condition, hour.time)}
       </div>
       <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100 font-sans tracking-tight">{hour.temp}°</span>
    </motion.div>
  );
});

function HourlyScroll({ data }: HourlyScrollProps) {
  return (
    <div className="w-full overflow-x-auto py-6 scrollbar-hide">
      <div className="flex gap-4 px-4 min-w-max">
        {data.map((hour, index) => (
          <HourCard key={index} hour={hour} index={index} />
        ))}
      </div>
    </div>
  );
}

export default memo(HourlyScroll);

