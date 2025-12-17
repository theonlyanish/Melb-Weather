"use client";
import { useState, useCallback, useTransition, memo } from "react";
import RegionalCitySelector from "@/components/SuburbSelector";
import Hero from "@/components/Hero";
import HourlyScroll from "@/components/HourlyScroll";
import WeekCards from "@/components/WeekCards";
import SidebarStories from "@/components/SidebarStories";
import CitySwitcher from "@/components/CitySwitcher";
import { LocationData } from "@/data/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader2 } from "lucide-react";

interface WeatherDashboardProps {
  initialData: LocationData | null;
  availableCities: string[];
  defaultCity: string;
  regionalCities: string[];
}

// Helper function to capitalize city names properly
function capitalizeCityName(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function WeatherDashboard({ initialData, availableCities, defaultCity, regionalCities }: WeatherDashboardProps) {
  const [selectedMajorCity, setSelectedMajorCity] = useState(defaultCity);
  const [locationData, setLocationData] = useState<LocationData | null>(initialData);
  const [currentRegionalCities, setCurrentRegionalCities] = useState(regionalCities);
  // Default to the major city itself (capitalized), not the first regional city
  const [selectedRegionalCity, setSelectedRegionalCity] = useState(capitalizeCityName(defaultCity));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleMajorCityChange = useCallback(async (majorCity: string) => {
    setSelectedMajorCity(majorCity);
    setError(null);
    
    startTransition(async () => {
      try {
        // Fetch the major city data to get regional cities list
        const stateResponse = await fetch(`/api/weather?city=${majorCity.toLowerCase()}&type=state`);
        if (!stateResponse.ok) throw new Error("Failed to fetch state data");
        
        const stateData = await stateResponse.json();
        setCurrentRegionalCities(stateData.regionalCities || []);
        
        // Fetch weather for the major city itself
        const response = await fetch(`/api/weather?city=${majorCity.toLowerCase()}`);
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data: LocationData = await response.json();
        setLocationData(data);
        // Set to capitalized major city name to match the regional cities format
        setSelectedRegionalCity(capitalizeCityName(majorCity));
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Failed to load weather data.");
      }
    });
  }, []);

  const handleRegionalCityChange = useCallback(async (regionalCity: string) => {
    setSelectedRegionalCity(regionalCity);
    setError(null);
    
    startTransition(async () => {
      try {
        // Normalize city name for API (lowercase, spaces preserved)
        const cityParam = encodeURIComponent(regionalCity.toLowerCase());
        const response = await fetch(`/api/weather?city=${cityParam}`);
        if (!response.ok) throw new Error("Failed to fetch");
        
        const data: LocationData = await response.json();
        setLocationData(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Failed to load weather data.");
      }
    });
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
                selectedCity={selectedMajorCity} 
                onSelect={handleMajorCityChange} 
              />
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs font-sans">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>
            
            {currentRegionalCities.length > 0 && (
              <div className="md:self-end">
                <RegionalCitySelector 
                  regionalCities={[capitalizeCityName(selectedMajorCity), ...currentRegionalCities]} 
                  selectedCity={selectedRegionalCity} 
                  onSelect={handleRegionalCityChange} 
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
            {locationData ? (
              <>
                <Hero weather={locationData.current} microtext={locationData.microtext} />
                <div className="glass-panel rounded-[2rem] p-2">
                  <HourlyScroll data={locationData.hourly} />
                </div>
                <WeekCards data={locationData.daily} />
              </>
            ) : (
              <div className="h-[600px]" />
            )}
          </div>
          <div className="lg:col-span-1">
            {locationData && <SidebarStories stories={locationData.stories} cityName={locationData.name} />}
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

