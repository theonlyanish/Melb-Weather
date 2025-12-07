// City coordinates for Open-Meteo API
export const CITY_COORDINATES: Record<string, { lat: number; lon: number; name: string; timezone: string }> = {
  melbourne: { lat: -37.8136, lon: 144.9631, name: "Melbourne", timezone: "Australia/Melbourne" },
  sydney: { lat: -33.8688, lon: 151.2093, name: "Sydney", timezone: "Australia/Sydney" },
  brisbane: { lat: -27.4698, lon: 153.0251, name: "Brisbane", timezone: "Australia/Brisbane" },
  tasmania: { lat: -42.8821, lon: 147.3272, name: "Tasmania", timezone: "Australia/Hobart" },
};

// Open-Meteo Weather Code to condition mapping
// Based on WMO Weather interpretation codes
const WEATHER_CODE_MAP: Record<number, string> = {
  0: "clear",        // Clear sky
  1: "clear",        // Mainly clear
  2: "cloudy",       // Partly cloudy
  3: "overcast",     // Overcast
  45: "cloudy",      // Fog
  48: "cloudy",      // Depositing rime fog
  51: "rainy",       // Light drizzle
  53: "rainy",       // Moderate drizzle
  55: "rainy",       // Dense drizzle
  56: "rainy",       // Light freezing drizzle
  57: "rainy",       // Dense freezing drizzle
  61: "rainy",       // Slight rain
  63: "rainy",       // Moderate rain
  65: "rainy",       // Heavy rain
  66: "rainy",       // Light freezing rain
  67: "rainy",       // Heavy freezing rain
  71: "snow",        // Slight snow fall
  73: "snow",        // Moderate snow fall
  75: "snow",        // Heavy snow fall
  77: "snow",        // Snow grains
  80: "rainy",       // Slight rain showers
  81: "rainy",       // Moderate rain showers
  82: "stormy",      // Violent rain showers
  85: "snow",        // Slight snow showers
  86: "snow",        // Heavy snow showers
  95: "stormy",      // Thunderstorm
  96: "stormy",      // Thunderstorm with slight hail
  99: "stormy",      // Thunderstorm with heavy hail
};

// Wind direction mapping
const WIND_DIRECTION_MAP: Record<number, string> = {
  0: "N", 22.5: "NNE", 45: "NE", 67.5: "ENE",
  90: "E", 112.5: "ESE", 135: "SE", 157.5: "SSE",
  180: "S", 202.5: "SSW", 225: "SW", 247.5: "WSW",
  270: "W", 292.5: "WNW", 315: "NW", 337.5: "NNW",
};

function getWindDirection(degrees: number): string {
  const keys = Object.keys(WIND_DIRECTION_MAP).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length; i++) {
    if (degrees < keys[i]) {
      return WIND_DIRECTION_MAP[keys[i - 1] || 0];
    }
  }
  return "N";
}

// Open-Meteo API response types
interface OpenMeteoCurrent {
  time: string;
  temperature_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weather_code: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  uv_index: number;
}

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  relative_humidity_2m: number[];
  uv_index: number[];
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
  uv_index_max: number[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

export async function fetchWeatherData(cityKey: string) {
  // Normalize key to lowercase to match our dictionary
  const normalizedKey = cityKey.toLowerCase();
  const city = CITY_COORDINATES[normalizedKey];
  
  if (!city) {
    console.error(`City not found for key: ${cityKey} (normalized: ${normalizedKey})`);
    // Fallback to Melbourne if city not found to prevent crashes
    const fallbackCity = CITY_COORDINATES["melbourne"];
    return fetchForCoordinates(fallbackCity, normalizedKey);
  }

  return fetchForCoordinates(city, normalizedKey);
}

async function fetchForCoordinates(city: { lat: number; lon: number; name: string; timezone: string }, cityKey: string) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.append("latitude", city.lat.toString());
  url.searchParams.append("longitude", city.lon.toString());
  url.searchParams.append("current", "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,relative_humidity_2m,apparent_temperature,uv_index");
  url.searchParams.append("hourly", "temperature_2m,weather_code,relative_humidity_2m,uv_index");
  url.searchParams.append("daily", "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,uv_index_max");
  url.searchParams.append("timezone", city.timezone);
  url.searchParams.append("forecast_days", "7");

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.statusText}`);
  }

  const data: OpenMeteoResponse = await response.json();

  // Transform to our data structure
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Get current condition
  const currentCondition = WEATHER_CODE_MAP[current.weather_code] || "cloudy";

  // Transform hourly data (next 12 hours)
  const hourlyForecast = hourly.time.slice(0, 12).map((timeStr, index) => {
    const time = new Date(timeStr);
    const hour = time.getHours();
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    
    let timeLabel = "Now";
    if (index > 0) {
      if (hour === 0) timeLabel = "12 AM";
      else if (hour < 12) timeLabel = `${hour} AM`;
      else if (hour === 12) timeLabel = "12 PM";
      else timeLabel = `${hour - 12} PM`;
    }

    return {
      time: timeLabel,
      temp: Math.round(hourly.temperature_2m[index]),
      condition: WEATHER_CODE_MAP[hourly.weather_code[index]] || "cloudy",
      isPeak,
    };
  });

  // Transform daily data
  // Get today's day index (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const dailyForecast = daily.time.slice(0, 7).map((timeStr, index) => {
    const condition = WEATHER_CODE_MAP[daily.weather_code[index]] || "cloudy";
    const mood = condition === "sunny" || condition === "clear" ? "orange" :
                 condition === "rainy" || condition === "stormy" ? "gray" :
                 condition === "snow" ? "blue" : "blue";
    
    // Calculate day name
    let dayName = "Today";
    if (index > 0) {
        const dayIndex = (today + index) % 7;
        dayName = dayNames[dayIndex];
    }
    
    return {
      day: dayName,
      high: Math.round(daily.temperature_2m_max[index]),
      low: Math.round(daily.temperature_2m_min[index]),
      condition,
      rainProb: daily.precipitation_probability_max?.[index] || 0,
      mood,
    };
  });

  // Use actual apparent temperature from API
  const feelsLike = Math.round(current.apparent_temperature);

  // Calculate dynamic stories based on weather data
  const stories = calculateDynamicStories(cityKey, {
    temp: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    rainProb: daily.precipitation_probability_max?.[0] || 0,
    uvIndex: current.uv_index,
    condition: currentCondition,
  });

  return {
    name: city.name,
    current: {
      temp: Math.round(current.temperature_2m),
      feelsLike,
      chanceRain: daily.precipitation_probability_max?.[0] || 0,
      windSpeed: Math.round(current.wind_speed_10m),
      windDir: getWindDirection(current.wind_direction_10m),
      condition: currentCondition,
      humidity: current.relative_humidity_2m,
      uvIndex: Math.round(current.uv_index),
    },
    hourly: hourlyForecast,
    daily: dailyForecast,
    stories,
  };
}

// Calculate dynamic stories based on real weather data
function calculateDynamicStories(cityKey: string, weather: {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  uvIndex: number;
  condition: string;
}) {
  const stories = [];

  // Umbrella Index - based on rain probability
  const umbrellaIndex = Math.min(10, Math.round(weather.rainProb / 10));
  stories.push({
    title: "Umbrella Index",
    value: `${umbrellaIndex}/10`,
    type: "bar",
    color: umbrellaIndex > 6 ? "bg-blue-500" : umbrellaIndex > 3 ? "bg-blue-400" : "bg-green-500",
  });

  // City-specific stories
  if (cityKey === "melbourne") {
    // Tram Delay Likelihood - based on weather conditions
    let tramDelay = "Low";
    let tramColor = "text-green-500";
    if (weather.condition === "stormy" || weather.windSpeed > 40) {
      tramDelay = "High";
      tramColor = "text-red-500";
    } else if (weather.condition === "rainy" || weather.windSpeed > 25) {
      tramDelay = "Moderate";
      tramColor = "text-yellow-500";
    }
    stories.push({
      title: "Tram Delay Likelihood",
      value: tramDelay,
      type: "text",
      color: tramColor,
    });

    // Coffee Quality (always high in Melbourne!)
    stories.push({
      title: "Coffee Quality",
      value: "11/10",
      type: "bar",
      color: "bg-amber-700",
    });
  }

  if (cityKey === "sydney") {
    // Beach Day Score
    let beachScore = 10;
    if (weather.condition === "rainy" || weather.condition === "stormy") beachScore -= 5;
    if (weather.temp < 20) beachScore -= 2;
    if (weather.windSpeed > 30) beachScore -= 2;
    beachScore = Math.max(0, Math.min(10, beachScore));
    stories.push({
      title: "Beach Day Score",
      value: `${beachScore}/10`,
      type: "bar",
      color: beachScore > 7 ? "bg-yellow-500" : beachScore > 4 ? "bg-orange-400" : "bg-gray-400",
    });

    // Humidity
    stories.push({
      title: "Humidity",
      value: weather.humidity > 70 ? "High" : weather.humidity > 50 ? "Moderate" : "Low",
      type: "text",
      color: weather.humidity > 70 ? "text-orange-400" : weather.humidity > 50 ? "text-yellow-400" : "text-green-400",
    });
  }

  if (cityKey === "brisbane") {
    // Humidity (Brisbane is known for humidity)
    const humidityPercent = Math.round(weather.humidity);
    stories.push({
      title: "Humidity",
      value: `${humidityPercent}%`,
      type: "bar",
      color: humidityPercent > 80 ? "bg-red-500" : humidityPercent > 60 ? "bg-orange-500" : "bg-green-500",
    });

    // Storm Risk
    let stormRisk = "Low";
    let stormColor = "text-green-500";
    if (weather.condition === "stormy") {
      stormRisk = "High";
      stormColor = "text-purple-500";
    } else if (weather.rainProb > 50 || weather.condition === "rainy") {
      stormRisk = "Moderate";
      stormColor = "text-yellow-500";
    }
    stories.push({
      title: "Storm Risk",
      value: stormRisk,
      type: "text",
      color: stormColor,
    });

    // River Level (simulated based on rain)
    stories.push({
      title: "River Level",
      value: weather.rainProb > 70 ? "Rising" : weather.rainProb > 40 ? "Elevated" : "Normal",
      type: "text",
      color: weather.rainProb > 70 ? "text-red-500" : weather.rainProb > 40 ? "text-yellow-500" : "text-blue-500",
    });
  }

  if (cityKey === "tasmania") {
    // Fireplace Index - based on temperature and wind
    let fireplaceIndex = 0;
    if (weather.temp < 10) fireplaceIndex = 10;
    else if (weather.temp < 15) fireplaceIndex = 8;
    else if (weather.temp < 18) fireplaceIndex = 6;
    else if (weather.temp < 22) fireplaceIndex = 4;
    else fireplaceIndex = 2;
    
    // Add wind factor
    if (weather.windSpeed > 20) fireplaceIndex = Math.min(10, fireplaceIndex + 1);
    
    stories.push({
      title: "Fireplace Index",
      value: `${fireplaceIndex}/10`,
      type: "bar",
      color: fireplaceIndex > 7 ? "bg-orange-600" : fireplaceIndex > 4 ? "bg-orange-400" : "bg-yellow-400",
    });

    // Aurora Chance (simplified - better in winter, clear skies)
    let auroraChance = "Low";
    let auroraColor = "text-gray-400";
    const month = new Date().getMonth();
    const isWinter = month >= 4 && month <= 8; // May to September
    if (isWinter && weather.condition === "clear") {
      auroraChance = "Moderate";
      auroraColor = "text-green-400";
    }
    stories.push({
      title: "Aurora Chance",
      value: auroraChance,
      type: "text",
      color: auroraColor,
    });

    // Oyster Quality (always good in Tassie!)
    stories.push({
      title: "Oyster Quality",
      value: "Peak",
      type: "text",
      color: "text-teal-500",
    });
  }

  // UV Index for all cities
  const uvLevel = weather.uvIndex > 10 ? "Extreme" : 
                  weather.uvIndex > 7 ? "Very High" : 
                  weather.uvIndex > 5 ? "High" : 
                  weather.uvIndex > 2 ? "Moderate" : "Low";
  const uvColor = weather.uvIndex > 10 ? "text-purple-600" :
                  weather.uvIndex > 7 ? "text-red-500" :
                  weather.uvIndex > 5 ? "text-orange-500" :
                  weather.uvIndex > 2 ? "text-yellow-500" : "text-green-500";
  
  stories.push({
    title: "UV Index",
    value: uvLevel,
    type: "text",
    color: uvColor,
  });

  return stories;
}

