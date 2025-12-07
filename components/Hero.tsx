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

  // More sophisticated, designer-friendly gradients
  const getGradient = (condition: string) => {
     switch (condition.toLowerCase()) {
       case "sunny": 
       case "clear":
       case "hot":
         // Warm amber to soft blue for Light Mode
         // Dark Mode: Deep Charcoal/Black with subtle warmth
         return "bg-gradient-to-br from-amber-200 via-orange-100 to-sky-200 dark:bg-none dark:bg-[#1A1C25]";
       case "rainy": 
         // Deep blue to indigo
         // Dark Mode: Deep Navy/Black
         return "bg-gradient-to-br from-blue-300 via-indigo-300 to-slate-400 dark:bg-none dark:bg-[#1A1C25]";
       case "stormy":
          // Purple to dark slate
          // Dark Mode: Deep Violet/Black
          return "bg-gradient-to-br from-indigo-400 via-purple-400 to-slate-600 dark:bg-none dark:bg-[#1A1C25]";
       case "cloudy": 
       case "overcast":
         // Silver to slate
         // Dark Mode: Deep Slate/Black
         return "bg-gradient-to-br from-gray-200 via-slate-200 to-zinc-300 dark:bg-none dark:bg-[#1A1C25]";
        case "snow":
            return "bg-gradient-to-br from-slate-100 via-sky-100 to-blue-100 dark:bg-none dark:bg-[#1A1C25]";
       default: 
         return "bg-gradient-to-br from-blue-200 to-blue-400 dark:bg-none dark:bg-[#1A1C25]";
     }
  };

  const getTextColor = (/* condition: string */) => {
    // In dark mode, we mostly want white text regardless, but in light mode, we might want contrast
    // However, the new gradients are softer, so dark text usually works best in light mode
    return "text-slate-800 dark:text-slate-100";
  };

  const textColor = getTextColor();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Elegant ease
      className={`relative w-full rounded-[3rem] p-8 md:p-12 overflow-hidden ${getGradient(weather.condition)} transition-all duration-1000 shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/5`}
    >
        {/* Subtle Noise Texture on Hero Card - Keep for texture but reduce opacity in dark mode */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Liquid/Glass Shine - REMOVED for Dark Mode cleanliness, kept subtle for Light Mode */}
        <div className="absolute inset-0 bg-white/10 opacity-50 dark:opacity-0 pointer-events-none rounded-[3rem]" />
        
      {/* Background Animation - Floating Elements */}
      <motion.div 
        animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute top-0 right-0 opacity-20 dark:opacity-5 pointer-events-none mix-blend-overlay dark:mix-blend-normal"
      >
        <Cloud className="w-96 h-96 text-white dark:text-slate-700" />
      </motion.div>

      <div className={`relative z-10 flex flex-col items-center text-center ${textColor}`}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
          className="mb-8"
        >
          {getIcon(weather.condition)}
        </motion.div>

        {/* Minimalist, huge typography */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
           className="relative"
        >
            <h1 className="text-[10rem] leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-slate-700 to-slate-900 dark:from-white dark:to-slate-300 drop-shadow-sm font-display">
            {weather.temp}°
            </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10 text-lg font-medium 
            px-8 py-4 rounded-full 
            bg-white/40 dark:bg-[#15161E] 
            text-slate-700 dark:text-slate-300 
            border border-white/30 dark:border-white/5 
            shadow-lg dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        >
          <span className="flex items-center gap-2">Feels like <span className="font-bold">{weather.feelsLike}°</span></span>
          <span className="opacity-30 dark:opacity-10">|</span>
          <span className="flex items-center gap-2"><Droplets className="w-5 h-5 opacity-70"/> {weather.chanceRain}%</span>
          <span className="opacity-30 dark:opacity-10">|</span>
          <span className="flex items-center gap-2"><Wind className="w-5 h-5 opacity-70"/> {weather.windSpeed}km/h {weather.windDir}</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {displayText && (
            <motion.p
              key={displayText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mt-10 text-xl font-normal italic opacity-70 max-w-lg tracking-wide font-sans"
            >
              “{displayText}”
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
