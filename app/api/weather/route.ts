import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weatherService";
import weatherData from "@/data/cities.json";
import { LocationData, WeatherData, StateData } from "@/data/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityKey = searchParams.get("city") || "melbourne";
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
    
    // Fetch weather data
    const realWeatherData = await fetchWeatherData(cityKey);
    
    // Find the appropriate state data
    let stateStaticData: StateData | undefined;
    
    // Check if this is a major city
    stateStaticData = typedWeatherData.states[cityKey];
    
    // If not found, check if this city belongs to any state's regional cities
    if (!stateStaticData) {
      const normalizedCityKey = cityKey.toLowerCase().replace(/\s+/g, '');
      for (const [stateKey, stateInfo] of Object.entries(typedWeatherData.states)) {
        const hasRegionalCity = stateInfo.regionalCities.some(
          city => city.toLowerCase().replace(/\s+/g, '') === normalizedCityKey
        );
        if (hasRegionalCity) {
          stateStaticData = stateInfo;
          break;
        }
      }
    }
    
    const mergedData: LocationData = {
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

    return NextResponse.json(mergedData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

