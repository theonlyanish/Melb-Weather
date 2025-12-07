"use client";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudLightning, Moon, CloudSnow } from "lucide-react";

export const AnimatedSun = ({ className }: { className?: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
    className={className}
  >
    <Sun className="w-full h-full" />
  </motion.div>
);

export const AnimatedCloud = ({ className }: { className?: string }) => (
  <motion.div
    animate={{ x: [-5, 5, -5] }}
    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
    className={className}
  >
    <Cloud className="w-full h-full" />
  </motion.div>
);

export const AnimatedRain = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <Cloud className="w-full h-full z-10 relative" />
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 10, opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      className="absolute top-1/2 left-1/4 text-blue-300"
    >
      💧
    </motion.div>
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 10, opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, delay: 0.5, ease: "linear" }}
      className="absolute top-1/2 left-1/2 text-blue-300"
    >
      💧
    </motion.div>
  </div>
);

export const AnimatedStorm = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <motion.div
      animate={{ x: [-2, 2, -2] }}
      transition={{ repeat: Infinity, duration: 0.2 }}
    >
      <CloudLightning className="w-full h-full" />
    </motion.div>
  </div>
);

export const AnimatedSnow = ({ className }: { className?: string }) => (
   <div className={`relative ${className}`}>
    <CloudSnow className="w-full h-full" />
  </div>
);

export const AnimatedMoon = ({ className }: { className?: string }) => (
  <motion.div
     animate={{ rotate: [-5, 5, -5] }}
     transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
     className={className}
  >
    <Moon className="w-full h-full" />
  </motion.div>
);

