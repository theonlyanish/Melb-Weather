"use client";
import { useState, useCallback, useTransition, memo } from "react";
import SuburbSelector from "@/components/SuburbSelector";
import Hero from "@/components/Hero";
import HourlyScroll from "@/components/HourlyScroll";
import WeekCards from "@/components/WeekCards";
import SidebarStories from "@/components/SidebarStories";
import CitySwitcher from "@/components/CitySwitcher";
import { CityData } from "@/data/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";

interface WeatherDashboardProps {
  initialData: CityData | null;
  availableCities: string[];
  defaultCity: string;
}

function WeatherDashboard({ initialData, availableCities, defaultCity }: WeatherDashboardProps) {
  const [selectedCityKey, setSelectedCityKey] = useState(defaultCity);
  const [cityData, setCityData] = useState<CityData | null>(initialData);
  const [selectedSuburb, setSelectedSuburb] = useState(initialData?.suburbs[0] || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCityChange = useCallback(async (city: string) => {
    setSelectedCityKey(city);
    setError(null);
    
    startTransition(async () => {
      try {
        const response = await fetch(`/api/weather?city=${city.toLowerCase()}`);
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data: CityData = await response.json();
        setCityData(data);
        if (data.suburbs?.length > 0) {
          setSelectedSuburb(data.suburbs[0]);
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Failed to load weather data.");
      }
    });
  }, []);

  const handleSuburbChange = useCallback((suburb: string) => {
    setSelectedSuburb(suburb);
  }, []);

  return (
    <>
      {/* Theme Switcher - Fixed Top Left */}
      <div className="fixed top-4 left-4 z-50 md:top-8 md:left-8">
        <ThemeToggle />
      </div>
      
      {/* Loading Overlay - Only for city switching */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-200">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-white/20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Fetching forecast...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-16 md:pt-4">
        <header className="relative pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
            <div className="space-y-2 pl-20 md:pl-0">
              <CitySwitcher 
                cities={availableCities} 
                selectedCity={selectedCityKey} 
                onSelect={handleCityChange} 
              />
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs font-sans">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>
            
            {cityData && cityData.suburbs.length > 0 && (
              <div className="md:self-end">
                <SuburbSelector 
                  suburbs={cityData.suburbs} 
                  selectedSuburb={selectedSuburb} 
                  onSelect={handleSuburbChange} 
                />
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 text-yellow-800 dark:text-yellow-200 text-sm font-sans">
            {error}
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="lg:col-span-2 space-y-8">
            {cityData ? (
              <>
                <Hero weather={cityData.current} microtext={cityData.microtext} />
                <div className="glass-panel rounded-[2rem] p-2">
                  <HourlyScroll data={cityData.hourly} />
                </div>
                <WeekCards data={cityData.daily} />
              </>
            ) : (
              <div className="h-[600px]" />
            )}
          </div>
          <div className="lg:col-span-1">
            {cityData && <SidebarStories stories={cityData.stories} cityName={cityData.name} />}
          </div>
        </div>
        
        <footer className="text-center text-slate-400 text-sm py-12 font-sans">
          <p>Designed with chaos in Australia. Powered by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 dark:hover:text-slate-300">Open-Meteo</a>.</p>
        </footer>
      </div>
    </>
  );
}

export default memo(WeatherDashboard);

