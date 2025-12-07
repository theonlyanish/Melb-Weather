"use client";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CitySwitcherProps {
  cities: string[];
  selectedCity: string;
  onSelect: (city: string) => void;
}

export default function CitySwitcher({ cities, selectedCity, onSelect }: CitySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
      >
        {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)} Weather
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
        >
            <ChevronDown className="w-8 h-8" />
        </motion.div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-56 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden z-50 p-2"
        >
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => {
                onSelect(city);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium ${
                selectedCity === city
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

