import { CITY_COORDINATES } from "@/lib/weatherService";
import weatherData from "@/data/cities.json";
import { WeatherData, StateData } from "@/data/types";

const typedWeatherData = weatherData as unknown as WeatherData;

// URL slugs use hyphens ("gold-coast"); data keys use spaces ("gold coast")
export function cityKeyToSlug(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, "-");
}

export function slugToCityKey(slug: string): string {
  return slug.toLowerCase().trim().replace(/-+/g, " ");
}

export interface ResolvedCity {
  cityKey: string; // data key, e.g. "gold coast"
  slug: string; // URL segment, e.g. "gold-coast"
  displayName: string; // e.g. "Gold Coast"
  majorCityKey: string; // hub city key, e.g. "brisbane"
  stateData: StateData;
}

function compact(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

/**
 * Every routable city: the 5 major cities plus all regional cities
 * that have coordinates. "tasmania" is a legacy alias, not a page.
 */
export function getAllCityKeys(): string[] {
  return Object.keys(CITY_COORDINATES).filter((key) => key !== "tasmania");
}

/** All routable cities with their slug and display name, for links and sitemaps. */
export function getAllCities(): { key: string; slug: string; name: string }[] {
  return getAllCityKeys().map((key) => ({
    key,
    slug: cityKeyToSlug(key),
    name: CITY_COORDINATES[key].name,
  }));
}

export function resolveCity(slug: string): ResolvedCity | null {
  const cityKey = slugToCityKey(slug);
  if (cityKey === "tasmania") return null;

  const coords = CITY_COORDINATES[cityKey];
  if (!coords) return null;

  // Major city: it is its own hub
  const majorState = typedWeatherData.states[cityKey];
  if (majorState) {
    return {
      cityKey,
      slug: cityKeyToSlug(cityKey),
      displayName: coords.name,
      majorCityKey: cityKey,
      stateData: majorState,
    };
  }

  // Regional city: find the state whose regionalCities list contains it
  for (const [majorKey, stateInfo] of Object.entries(typedWeatherData.states)) {
    if (stateInfo.regionalCities.some((c) => compact(c) === compact(cityKey))) {
      return {
        cityKey,
        slug: cityKeyToSlug(cityKey),
        displayName: coords.name,
        majorCityKey: majorKey,
        stateData: stateInfo,
      };
    }
  }

  return null;
}

/** City-specific microtext with state-level fallback, same lookup the API route uses. */
export function getCityMicrotext(city: ResolvedCity): string[] {
  return (
    typedWeatherData.cityMicrotext?.[city.cityKey] ||
    city.stateData.microtext ||
    []
  );
}
