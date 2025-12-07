"use client";
import { useState, useEffect } from "react";
import SuburbSelector from "@/components/SuburbSelector";
import Hero from "@/components/Hero";
import HourlyScroll from "@/components/HourlyScroll";
import WeekCards from "@/components/WeekCards";
import SidebarStories from "@/components/SidebarStories";
import CitySwitcher from "@/components/CitySwitcher";
import weatherData from "@/data/cities.json";
import { WeatherData, CityData } from "@/data/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [selectedCityKey, setSelectedCityKey] = useState("melbourne");
  const typedWeatherData = weatherData as unknown as WeatherData;
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [selectedSuburb, setSelectedSuburb] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data when city changes
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/weather?city=${selectedCityKey.toLowerCase()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data: CityData = await response.json();
        
        if (isMounted) {
            setCityData(data);
            if (data.suburbs && data.suburbs.length > 0) {
                setSelectedSuburb(data.suburbs[0]);
            }
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        if (isMounted) {
            setError("Failed to load weather data. Using fallback data.");
            // Fallback to mock data
            const fallbackData = typedWeatherData.cities[selectedCityKey.toLowerCase()];
            if (fallbackData) {
              setCityData(fallbackData);
              setSelectedSuburb(fallbackData.suburbs[0] || "");
            }
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [selectedCityKey, typedWeatherData]);

  const handleCityChange = (city: string) => {
    setSelectedCityKey(city);
  };

  const handleSuburbChange = (suburb: string) => {
    setSelectedSuburb(suburb);
    // Suburb changes don't affect weather data (same city)
  };

  return (
    <main className="min-h-screen p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 dark:brightness-50 mix-blend-overlay"></div>

      {/* Background Blobs for Liquid Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] -z-10 animate-blob" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10 animate-blob animation-delay-2000" />
      <div className="fixed top-[20%] right-[20%] w-[40%] h-[40%] bg-yellow-100/30 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10 animate-blob animation-delay-4000" />

      {/* Theme Switcher - Fixed Top Left */}
      <div className="fixed top-4 left-4 z-50 md:top-8 md:left-8">
          <ThemeToggle />
      </div>
      
      {/* Loading Overlay */}
      {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-all duration-300">
              <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-white/20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Fetching forecast...</p>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-16 md:pt-4">
        <header className="relative pb-8">
           {/* Main Header Content */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
             <div className="space-y-2 pl-20 md:pl-0"> 
               {/* City Switcher */}
               <CitySwitcher 
                   cities={Object.keys(typedWeatherData.cities)} 
                   selectedCity={selectedCityKey} 
                   onSelect={handleCityChange} 
               />
               {/* Date */}
               <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs font-sans">
                 {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
               </p>
             </div>
             
             {!loading && cityData && cityData.suburbs.length > 0 && (
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

        {/* Content - Always render previous content if available, or empty structure if first load */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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
                <div className="h-[600px]"></div> // Spacer for first load
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
    </main>
  );
}
