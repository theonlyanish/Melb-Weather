import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weatherService";
import weatherData from "@/data/cities.json";
import { CityData } from "@/data/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityKey = searchParams.get("city") || "melbourne";

  try {
    const realWeatherData = await fetchWeatherData(cityKey);
    
    // Merge with static data (suburbs, microtext)
    const staticData = (weatherData as Record<string, unknown>).cities as Record<string, CityData>;
    const cityStaticData = staticData?.[cityKey];
    
    const mergedData: CityData = {
      name: realWeatherData.name,
      suburbs: cityStaticData?.suburbs || [],
      current: realWeatherData.current,
      microtext: cityStaticData?.microtext || [],
      hourly: realWeatherData.hourly,
      daily: realWeatherData.daily,
      // Use dynamic stories from API, fallback to static if not available
      stories: realWeatherData.stories || cityStaticData?.stories || [],
    };

    return NextResponse.json(mergedData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

