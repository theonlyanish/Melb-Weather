"use client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { memo, useCallback } from "react";

interface RegionalCitySelectorProps {
  regionalCities: string[];
  selectedCity: string;
  onSelect: (city: string) => void;
}

function RegionalCitySelector({ regionalCities, selectedCity, onSelect }: RegionalCitySelectorProps) {
  const handleSelect = useCallback((city: string) => {
    onSelect(city);
  }, [onSelect]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide px-4"
    >
      <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
      {regionalCities.map((city) => (
        <button
          key={city}
          onClick={() => handleSelect(city)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            selectedCity === city
              ? "bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105"
              : "bg-white/70 dark:bg-slate-800/70 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 hover:text-black dark:hover:text-white"
          }`}
        >
          {city}
        </button>
      ))}
    </motion.div>
  );
}

export default memo(RegionalCitySelector);

