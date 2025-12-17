import { Suspense } from "react";
import weatherData from "@/data/cities.json";
import { WeatherData, LocationData } from "@/data/types";
import { fetchWeatherData } from "@/lib/weatherService";
import WeatherDashboard from "@/components/WeatherDashboard";
import { Loader2 } from "lucide-react";

// Enable ISR - revalidate every 10 minutes for fresh weather data
export const revalidate = 600;

// Server-side data fetching
async function getWeatherData(cityKey: string): Promise<LocationData | null> {
  const typedWeatherData = weatherData as unknown as WeatherData;
  
  try {
    const realWeatherData = await fetchWeatherData(cityKey);
    const stateStaticData = typedWeatherData.states[cityKey];
    
    return {
      name: realWeatherData.name,
      state: stateStaticData?.state,
      current: realWeatherData.current,
      microtext: stateStaticData?.microtext || [],
      hourly: realWeatherData.hourly,
      daily: realWeatherData.daily,
      stories: realWeatherData.stories || stateStaticData?.stories || [],
      airQuality: realWeatherData.airQuality,
      regionalCities: stateStaticData?.regionalCities || [],
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Fallback to static data
    const stateData = typedWeatherData.states[cityKey];
    if (!stateData) return null;
    
    return {
      name: stateData.name,
      state: stateData.state,
      current: {
        temp: 20,
        feelsLike: 20,
        chanceRain: 0,
        windSpeed: 10,
        windDir: "N",
        condition: "sunny"
      },
      microtext: stateData.microtext,
      hourly: [],
      daily: [],
      stories: stateData.stories,
      regionalCities: stateData.regionalCities,
    };
  }
}

function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-white/20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">Loading forecast...</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const typedWeatherData = weatherData as unknown as WeatherData;
  const defaultCity = "melbourne";
  
  // Pre-fetch default city data on server
  const initialData = await getWeatherData(defaultCity);
  
  return (
    <main className="min-h-screen p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 relative overflow-hidden">
      {/* Optimized Background - use CSS gradients instead of animated blobs on mobile */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      {/* Animated Blobs - Hidden on mobile for performance, GPU accelerated */}
      <div 
        className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] -z-10 animate-blob will-change-transform hidden md:block" 
        style={{ transform: 'translateZ(0)' }}
      />
      <div 
        className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10 animate-blob animation-delay-2000 will-change-transform hidden md:block"
        style={{ transform: 'translateZ(0)' }}
      />
      <div 
        className="fixed top-[20%] right-[20%] w-[40%] h-[40%] bg-yellow-100/30 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10 animate-blob animation-delay-4000 will-change-transform hidden md:block"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Noise Texture Overlay - Only on desktop */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 dark:brightness-50 mix-blend-overlay hidden md:block" />

      <Suspense fallback={<LoadingFallback />}>
        <WeatherDashboard 
          initialData={initialData}
          availableCities={Object.keys(typedWeatherData.states)}
          defaultCity={defaultCity}
          regionalCities={initialData?.regionalCities || []}
        />
      </Suspense>
    </main>
  );
}
