"use client";
import { useCallback, useTransition, memo } from "react";
import { useRouter } from "next/navigation";
import RegionalCitySelector from "@/components/SuburbSelector";
import Hero from "@/components/Hero";
import HourlyScroll from "@/components/HourlyScroll";
import WeekCards from "@/components/WeekCards";
import SidebarStories from "@/components/SidebarStories";
import CitySwitcher from "@/components/CitySwitcher";
import { LocationData } from "@/data/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import LoadingSpinner from "@/components/LoadingSpinner";
import RainAnimation from "@/components/RainAnimation";

interface WeatherDashboardProps {
  initialData: LocationData | null;
  availableCities: string[];
  majorCityKey: string;
  currentCityName: string;
  regionalCities: string[];
}

// Helper function to capitalize city names properly
function capitalizeCityName(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// "Gold Coast" -> "/gold-coast"
function cityNameToPath(city: string): string {
  return `/${city.toLowerCase().trim().replace(/\s+/g, "-")}`;
}

function WeatherDashboard({ initialData, availableCities, majorCityKey, currentCityName, regionalCities }: WeatherDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Each city is its own route, so switching is a navigation. The server
  // renders the new city's data and metadata; no client-side fetching needed.
  const navigateToCity = useCallback((city: string) => {
    startTransition(() => {
      router.push(cityNameToPath(city));
    });
  }, [router]);

  const locationData = initialData;

  return (
    <>
      {/* Rain Animation - Background layer, only shows when definitely raining */}
      <RainAnimation weather={locationData?.current || null} />

      {/* Theme Switcher - Absolute Top Left */}
      <div className="absolute top-4 left-4 z-50 md:top-8 md:left-8">
        <ThemeToggle />
      </div>

      {/* Loading Overlay - Only for city switching */}
      {isPending && <LoadingSpinner message="Fetching forecast..." />}

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-10 pt-20 md:pt-4">
        <header className="relative pb-4 md:pb-8">
          <div className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4 pt-4">
            <div className="space-y-2 text-center md:text-left">
              <CitySwitcher
                cities={availableCities}
                selectedCity={majorCityKey}
                onSelect={navigateToCity}
              />
              <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs font-sans">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </div>

            {regionalCities.length > 0 && (
              <div className="md:self-end w-full md:w-auto flex justify-center md:block">
                <RegionalCitySelector
                  regionalCities={[capitalizeCityName(majorCityKey), ...regionalCities]}
                  selectedCity={currentCityName}
                  onSelect={navigateToCity}
                />
              </div>
            )}
          </div>
        </header>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {locationData ? (
              <>
                <section aria-label="Current weather conditions">
                  <Hero weather={locationData.current} microtext={locationData.microtext} />
                </section>
                <section aria-label="Hourly forecast" className="glass-panel rounded-[2rem] p-2">
                  <HourlyScroll data={locationData.hourly} />
                </section>
                <section aria-label="7-day forecast">
                  <WeekCards data={locationData.daily} />
                </section>
              </>
            ) : (
              <div className="h-[600px]" />
            )}
          </div>
          <aside className="lg:col-span-1" aria-label="Weather stories and local information">
            {locationData && <SidebarStories stories={locationData.stories} cityName={locationData.name} />}
          </aside>
        </div>

        <footer className="text-center text-sm py-12 font-sans text-slate-400 dark:text-slate-500">
          LocalSky by{" "}
          <a
            href="https://anishkapse.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors duration-200 hover:text-[rgb(218,65,103)]"
          >
            Anish Kapse
          </a>
        </footer>
      </div>
    </>
  );
}

export default memo(WeatherDashboard);
