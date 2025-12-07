"use client";
import { useState } from "react";
import SuburbSelector from "@/components/SuburbSelector";
import Hero from "@/components/Hero";
import HourlyScroll from "@/components/HourlyScroll";
import WeekCards from "@/components/WeekCards";
import SidebarStories from "@/components/SidebarStories";
import CitySwitcher from "@/components/CitySwitcher";
import weatherData from "@/data/cities.json";
import { WeatherData, CityData } from "@/data/types";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [selectedCityKey, setSelectedCityKey] = useState("melbourne");
  // Cast data to correct type
  const typedWeatherData = weatherData as unknown as WeatherData;
  const [cityData, setCityData] = useState<CityData>(typedWeatherData.cities["melbourne"]);
  const [selectedSuburb, setSelectedSuburb] = useState(cityData.suburbs[0]);

  const handleCityChange = (city: string) => {
      setSelectedCityKey(city);
      const newData = typedWeatherData.cities[city];
      setCityData(newData);
      setSelectedSuburb(newData.suburbs[0]);
  };

  const handleSuburbChange = (suburb: string) => {
    setSelectedSuburb(suburb);
    // Simulate data change for visual variety
    const conditions = ["sunny", "cloudy", "rainy", "stormy", "clear", "hot", "snow"];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 25) + 5;
    
    setCityData(prev => ({
      ...prev,
      current: {
        ...prev.current,
        temp: randomTemp,
        condition: randomCondition,
        feelsLike: randomTemp - 2,
        chanceRain: Math.floor(Math.random() * 100)
      }
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 relative overflow-hidden transition-colors duration-500">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 dark:brightness-50 mix-blend-overlay"></div>

      {/* Background Blobs for Liquid Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] -z-10 animate-blob" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10 animate-blob animation-delay-2000" />
      <div className="fixed top-[20%] right-[20%] w-[40%] h-[40%] bg-yellow-100/30 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
           <div className="space-y-1">
             <div className="flex items-center gap-4">
                <CitySwitcher 
                    cities={Object.keys(typedWeatherData.cities)} 
                    selectedCity={selectedCityKey} 
                    onSelect={handleCityChange} 
                />
                <ThemeToggle />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium ml-1 tracking-wide uppercase text-xs">Sunday, Dec 7</p>
           </div>
           <SuburbSelector 
             suburbs={cityData.suburbs} 
             selectedSuburb={selectedSuburb} 
             onSelect={handleSuburbChange} 
           />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Hero weather={cityData.current} microtext={cityData.microtext} />
            <div className="glass-panel rounded-[2rem] p-2">
                <HourlyScroll data={cityData.hourly} />
            </div>
            <WeekCards data={cityData.daily} />
          </div>
          <div className="lg:col-span-1">
            <SidebarStories stories={cityData.stories} />
          </div>
        </div>
        
        <footer className="text-center text-slate-400 text-sm py-12">
          <p>Designed with chaos in Australia.</p>
        </footer>
      </div>
    </main>
  );
}
