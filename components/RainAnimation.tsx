"use client";
import { useEffect, useState } from "react";
import ReactRain from "react-rain-animation";
import "react-rain-animation/lib/style.css";
import { CurrentWeather } from "@/data/types";

interface RainAnimationProps {
  weather: CurrentWeather | null;
}

export default function RainAnimation({ weather }: RainAnimationProps) {
  const [numDrops, setNumDrops] = useState(0);
  const [isRaining, setIsRaining] = useState(false);

  useEffect(() => {
    if (!weather) {
      setIsRaining(false);
      setNumDrops(0);
      return;
    }

    // Only show rain if condition is definitely rainy/stormy AND chance of rain is significant
    const definitelyRaining = 
      (weather.condition === "rainy" || weather.condition === "stormy") && 
      weather.chanceRain >= 30; // Only show if at least 30% chance

    setIsRaining(definitelyRaining);

    if (definitelyRaining) {
      // Calculate number of drops based on rain intensity
      // Light rain (30-50%): 100-200 drops
      // Moderate rain (50-70%): 200-350 drops
      // Heavy rain (70-90%): 350-500 drops
      // Very heavy/stormy (90%+): 500-700 drops
      let drops = 0;
      
      if (weather.condition === "stormy") {
        // Storms get more intense rain
        drops = Math.min(700, Math.max(400, Math.round(weather.chanceRain * 7)));
      } else if (weather.chanceRain >= 90) {
        drops = 500;
      } else if (weather.chanceRain >= 70) {
        drops = Math.round(350 + (weather.chanceRain - 70) * 7.5); // 350-500
      } else if (weather.chanceRain >= 50) {
        drops = Math.round(200 + (weather.chanceRain - 50) * 7.5); // 200-350
      } else {
        drops = Math.round(100 + (weather.chanceRain - 30) * 5); // 100-200
      }

      setNumDrops(drops);
    } else {
      setNumDrops(0);
    }
  }, [weather]);

  if (!isRaining || numDrops === 0) {
    return null;
  }

  return (
    <div 
      className="fixed pointer-events-none z-0 overflow-hidden"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100vh',
        // Ensure it works in both light and dark mode
        // The rain animation uses CSS that should work with both themes
        opacity: 0.5, // Subtle, not excessive - won't interfere with content readability
      }}
    >
      <ReactRain numDrops={numDrops} />
    </div>
  );
}

