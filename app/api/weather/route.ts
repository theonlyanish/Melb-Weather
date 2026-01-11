import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weatherService";
import weatherData from "@/data/cities.json";
import { LocationData, WeatherData, StateData } from "@/data/types";

// Helper to get the normalized city key for microtext lookup
function getNormalizedCityKey(cityKey: string): string {
  return cityKey.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Helper to fetch a single city's weather data with error isolation
async function fetchCityWeather(cityKey: string, typedWeatherData: WeatherData): Promise<{ data: LocationData | null; error: string | null; cityKey: string }> {
  try {
    const realWeatherData = await fetchWeatherData(cityKey);
    
    // Find the appropriate state data
    let stateStaticData: StateData | undefined;
    
    // Check if this is a major city
    stateStaticData = typedWeatherData.states[cityKey];
    
    // If not found, check if this city belongs to any state's regional cities
    if (!stateStaticData) {
      const normalizedCityKey = cityKey.toLowerCase().replace(/\s+/g, '');
      for (const [, stateInfo] of Object.entries(typedWeatherData.states)) {
        const hasRegionalCity = stateInfo.regionalCities.some(
          city => city.toLowerCase().replace(/\s+/g, '') === normalizedCityKey
        );
        if (hasRegionalCity) {
          stateStaticData = stateInfo;
          break;
        }
      }
    }
    
    // Get city-specific microtext first, fall back to state microtext
    const normalizedKey = getNormalizedCityKey(cityKey);
    const cityMicrotext = typedWeatherData.cityMicrotext?.[normalizedKey] 
      || stateStaticData?.microtext 
      || [];
    
    const mergedData: LocationData = {
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

    return { data: mergedData, error: null, cityKey };
  } catch (error) {
    console.error(`Error fetching weather for ${cityKey}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Unknown error", 
      cityKey 
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityKey = searchParams.get("city") || "melbourne";
  const citiesParam = searchParams.get("cities"); // comma-separated list for batch requests
  const type = searchParams.get("type"); // 'state' or undefined for weather

  try {
    const typedWeatherData = weatherData as unknown as WeatherData;
    
    // If requesting state info only (for regional cities list)
    if (type === "state") {
      const stateData = typedWeatherData.states[cityKey];
      if (!stateData) {
        return NextResponse.json(
          { error: "State not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(stateData);
    }
    
    // Batch request: fetch multiple cities in parallel with error isolation
    // Each city fetch is independent - one failure won't affect others
    if (citiesParam) {
      const cities = citiesParam.split(',').map(c => c.trim()).filter(Boolean);
      
      // Fetch all cities in parallel using Promise.allSettled for error isolation
      const results = await Promise.all(
        cities.map(city => fetchCityWeather(city, typedWeatherData))
      );
      
      // Return results with both successes and failures
      const response: Record<string, { data: LocationData | null; error: string | null }> = {};
      for (const result of results) {
        response[result.cityKey] = { data: result.data, error: result.error };
      }
      
      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }
    
    // Single city request
    const result = await fetchCityWeather(cityKey, typedWeatherData);
    
    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch weather data" },
        { status: 500 }
      );
    }

    // Cache weather data for 5 minutes, allow stale for 1 min while revalidating
    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error("Error in weather API:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

