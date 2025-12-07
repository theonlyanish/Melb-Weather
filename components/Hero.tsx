"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Droplets, Wind } from "lucide-react";
import { CurrentWeather } from "@/data/types";
import { useEffect, useState } from "react";
import { AnimatedSun, AnimatedCloud, AnimatedRain, AnimatedStorm, AnimatedSnow } from "./AnimatedIcons";

interface HeroProps {
  weather: CurrentWeather;
  microtext: string[];
}

export default function Hero({ weather, microtext }: HeroProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    setDisplayText(microtext[Math.floor(Math.random() * microtext.length)]);
  }, [microtext]);

  const getIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny": 
      case "clear":
      case "hot":
        return <AnimatedSun className="w-40 h-40 text-yellow-400 drop-shadow-lg" />;
      case "rainy": 
        return <AnimatedRain className="w-40 h-40 text-blue-200 drop-shadow-lg" />;
      case "stormy":
        return <AnimatedStorm className="w-40 h-40 text-purple-200 drop-shadow-lg" />;
      case "snow":
        return <AnimatedSnow className="w-40 h-40 text-white drop-shadow-lg" />;
      case "cloudy": 
      case "overcast":
        return <AnimatedCloud className="w-40 h-40 text-white/90 drop-shadow-lg" />;
      default: 
        return <AnimatedCloud className="w-40 h-40 text-white/90 drop-shadow-lg" />;
    }
  };

  const getGradient = (condition: string) => {
     switch (condition.toLowerCase()) {
       case "sunny": 
       case "clear":
       case "hot":
         return "from-yellow-300/80 via-orange-200/80 to-blue-300/80";
       case "rainy": 
         return "from-blue-400/80 via-blue-500/80 to-indigo-700/80";
       case "stormy":
          return "from-indigo-600/80 via-purple-700/80 to-slate-800/80";
       case "cloudy": 
       case "overcast":
         return "from-gray-300/80 via-slate-300/80 to-slate-500/80";
        case "snow":
            return "from-slate-100/90 via-blue-100/80 to-blue-200/80";
       default: 
         return "from-blue-200/80 to-blue-400/80";
     }
  };

  const getTextColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "rainy":
      case "stormy":
        return "text-white";
      default:
        return "text-slate-800";
    }
  };

  const textColor = getTextColor(weather.condition);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full rounded-[3rem] p-8 md:p-12 overflow-hidden bg-gradient-to-br ${getGradient(weather.condition)} transition-all duration-1000 shadow-2xl backdrop-blur-3xl border border-white/20`}
    >
        {/* Liquid/Glass Shine */}
        <div className="absolute inset-0 bg-white/10 opacity-50 pointer-events-none rounded-[3rem]" />
        
      {/* Background Animation */}
      <motion.div 
        animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute top-0 right-0 opacity-30 pointer-events-none mix-blend-overlay"
      >
        <Cloud className="w-96 h-96 text-white" />
      </motion.div>

      <div className={`relative z-10 flex flex-col items-center text-center ${textColor}`}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-4"
        >
          {getIcon(weather.condition)}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="text-9xl font-bold tracking-tighter"
        >
          {weather.temp}°
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center gap-4 md:gap-8 text-lg font-medium glass-panel px-8 py-4 rounded-full text-current"
        >
          <span>Feels like {weather.feelsLike}°</span>
          <span className="opacity-50">|</span>
          <span className="flex items-center gap-2"><Droplets className="w-5 h-5"/> {weather.chanceRain}%</span>
          <span className="opacity-50">|</span>
          <span className="flex items-center gap-2"><Wind className="w-5 h-5"/> {weather.windSpeed}km/h {weather.windDir}</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {displayText && (
            <motion.p
              key={displayText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mt-8 text-xl font-serif italic opacity-80 max-w-lg"
            >
              “{displayText}”
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
