import { Suspense } from "react";
import weatherData from "@/data/cities.json";
import { WeatherData, LocationData } from "@/data/types";
import { fetchWeatherData } from "@/lib/weatherService";
import { SITE_URL } from "@/lib/site";
import WeatherDashboard from "@/components/WeatherDashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

// Enable ISR - revalidate every 5 minutes for fresh weather data
// Must be ≤ the API fetch cache (300s) to avoid stale data
export const revalidate = 300;

// Dynamic metadata generation for SEO
export async function generateMetadata() {
  const typedWeatherData = weatherData as unknown as WeatherData;
  const defaultCity = "melbourne";
  
  try {
    const initialData = await getWeatherData(defaultCity);
    const cityName = initialData?.name || "Melbourne";
    const state = initialData?.state || "Victoria";
    const temp = initialData?.current?.temp || null;
    const condition = initialData?.current?.condition || "sunny";
    
    const title = `${cityName} Weather Forecast - ${state} | LocalSky`;
    const description = temp 
      ? `Current weather in ${cityName}, ${state}: ${temp}°C, ${condition}. Get hourly and daily forecasts, air quality, and local weather stories.`
      : `Get accurate weather forecasts for ${cityName}, ${state}. Real-time weather data, hourly forecasts, and local weather stories with personality.`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: SITE_URL,
        siteName: "LocalSky",
        locale: "en_AU",
        type: "website",
        // og:image comes from app/opengraph-image.tsx (generated dynamically)
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: SITE_URL,
      },
    };
  } catch (error) {
    // Fallback metadata
    return {
      title: "LocalSky - Australian Weather Forecast",
      description: "Get accurate weather forecasts for Australian cities including Melbourne, Sydney, Brisbane, Perth, and Hobart.",
    };
  }
}

// Helper to get the normalized city key for microtext lookup
function getNormalizedCityKey(cityKey: string): string {
  return cityKey.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Server-side data fetching
async function getWeatherData(cityKey: string): Promise<LocationData | null> {
  const typedWeatherData = weatherData as unknown as WeatherData;
  
  try {
    const realWeatherData = await fetchWeatherData(cityKey);
    const stateStaticData = typedWeatherData.states[cityKey];
    
    // Get city-specific microtext first, fall back to state microtext
    const normalizedKey = getNormalizedCityKey(cityKey);
    const cityMicrotext = typedWeatherData.cityMicrotext?.[normalizedKey] 
      || stateStaticData?.microtext 
      || [];
    
    return {
      name: realWeatherData.name,
      state: stateStaticData?.state,
      current: realWeatherData.current,
      microtext: cityMicrotext,
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
    
    // Get city-specific microtext for fallback too
    const normalizedKey = getNormalizedCityKey(cityKey);
    const cityMicrotext = typedWeatherData.cityMicrotext?.[normalizedKey] 
      || stateData.microtext;
    
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
      microtext: cityMicrotext,
      hourly: [],
      daily: [],
      stories: stateData.stories,
      regionalCities: stateData.regionalCities,
    };
  }
}

function LoadingFallback() {
  return <LoadingSpinner />;
}

export default async function Home() {
  const typedWeatherData = weatherData as unknown as WeatherData;
  const defaultCity = "melbourne";
  
  // Pre-fetch default city data on server
  const initialData = await getWeatherData(defaultCity);
  
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "LocalSky",
    "description": "Australian weather forecast application providing real-time weather data, hourly and daily forecasts, and local weather stories for major Australian cities.",
    "applicationCategory": "WeatherApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "AUD"
    },
    ...(initialData && {
      "mainEntity": {
        "@type": "WeatherForecast",
        "location": {
          "@type": "City",
          "name": initialData.name,
          "addressRegion": initialData.state,
          "addressCountry": "AU"
        },
        "temperature": {
          "@type": "QuantitativeValue",
          "value": initialData.current.temp,
          "unitCode": "CEL"
        },
        "conditions": initialData.current.condition,
        "windSpeed": {
          "@type": "QuantitativeValue",
          "value": initialData.current.windSpeed,
          "unitCode": "KMH"
        }
      }
    })
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LocalSky",
    "url": SITE_URL,
    "logo": `${SITE_URL}/android-chrome-512x512.png`,
    "sameAs": [
      "https://anishkapse.com"
    ],
    "founder": {
      "@type": "Person",
      "name": "Anish Kapse",
      "url": "https://anishkapse.com"
    }
  };
  
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
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
    </>
  );
}
