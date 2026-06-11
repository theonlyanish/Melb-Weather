import { Suspense } from "react";
import { Metadata } from "next";
import weatherData from "@/data/cities.json";
import { LocationData, WeatherData } from "@/data/types";
import { fetchWeatherData } from "@/lib/weatherService";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import {
  getAllCityKeys,
  getAllCities,
  cityKeyToSlug,
  resolveCity,
  getCityMicrotext,
  ResolvedCity,
} from "@/lib/cities";
import WeatherDashboard from "@/components/WeatherDashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

// Enable ISR - revalidate every 5 minutes for fresh weather data
// Must be ≤ the API fetch cache (300s) to avoid stale data
export const revalidate = 300;

// Only the cities we know about exist; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCityKeys().map((key) => ({ city: cityKeyToSlug(key) }));
}

// Dynamic metadata generation for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const resolved = resolveCity(city);
  if (!resolved) return {};

  const cityUrl = `${SITE_URL}/${resolved.slug}`;
  const cityName = resolved.displayName;
  const state = resolved.stateData.state;

  try {
    const initialData = await getWeatherData(resolved);
    const temp = initialData?.current?.temp ?? null;
    const condition = initialData?.current?.condition || "sunny";

    const title = `${cityName} Weather Forecast - ${state} | LocalSky`;
    const description = temp !== null
      ? `Current weather in ${cityName}, ${state}: ${temp}°C, ${condition}. Get hourly and daily forecasts, air quality, and local weather stories.`
      : `Get accurate weather forecasts for ${cityName}, ${state}. Real-time weather data, hourly forecasts, and local weather stories with personality.`;

    return {
      // absolute: the layout's "%s | LocalSky" template would double the brand
      title: { absolute: title },
      description,
      openGraph: {
        title,
        description,
        url: cityUrl,
        siteName: "LocalSky",
        locale: "en_AU",
        type: "website",
        // og:image comes from app/[city]/opengraph-image.tsx (generated dynamically)
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      alternates: {
        canonical: cityUrl,
      },
    };
  } catch {
    // Fallback metadata
    return {
      title: { absolute: `${cityName} Weather Forecast - ${state} | LocalSky` },
      description: `Get accurate weather forecasts for ${cityName}, ${state}. Real-time weather data, hourly forecasts, and local weather stories.`,
      alternates: {
        canonical: cityUrl,
      },
    };
  }
}

// Server-side data fetching
async function getWeatherData(resolved: ResolvedCity): Promise<LocationData | null> {
  const cityMicrotext = getCityMicrotext(resolved);

  try {
    const realWeatherData = await fetchWeatherData(resolved.cityKey);

    return {
      name: realWeatherData.name,
      state: resolved.stateData.state,
      current: realWeatherData.current,
      microtext: cityMicrotext,
      hourly: realWeatherData.hourly,
      daily: realWeatherData.daily,
      stories: realWeatherData.stories || resolved.stateData.stories || [],
      airQuality: realWeatherData.airQuality,
      regionalCities: resolved.stateData.regionalCities || [],
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Fallback to static data so the page still renders
    return {
      name: resolved.displayName,
      state: resolved.stateData.state,
      current: {
        temp: 20,
        feelsLike: 20,
        chanceRain: 0,
        windSpeed: 10,
        windDir: "N",
        condition: "sunny",
      },
      microtext: cityMicrotext,
      hourly: [],
      daily: [],
      stories: resolved.stateData.stories,
      regionalCities: resolved.stateData.regionalCities,
    };
  }
}

function LoadingFallback() {
  return <LoadingSpinner />;
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const resolved = resolveCity(city);
  if (!resolved) return null; // unreachable with dynamicParams = false

  // Pre-fetch city data on server
  const initialData = await getWeatherData(resolved);
  const cityUrl = `${SITE_URL}/${resolved.slug}`;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "LocalSky",
    "url": cityUrl,
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
          availableCities={Object.keys((weatherData as unknown as WeatherData).states)}
          majorCityKey={resolved.majorCityKey}
          currentCityName={resolved.displayName}
          regionalCities={resolved.stateData.regionalCities || []}
        />
      </Suspense>

      {/* Crawlable links to every city page */}
      <nav
        aria-label="Weather for all cities"
        className="max-w-7xl mx-auto relative z-10 pb-10 text-center font-sans"
      >
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
          {getAllCities().map(({ slug, name }) => (
            <li key={slug}>
              <Link
                href={`/${slug}`}
                className={`transition-colors duration-200 hover:text-slate-600 dark:hover:text-slate-300 ${
                  slug === resolved.slug ? "text-slate-600 dark:text-slate-300 font-medium" : ""
                }`}
              >
                {name} weather
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
    </>
  );
}
