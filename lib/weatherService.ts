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
  wind_gusts_10m: number;
  weather_code: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  uv_index: number;
  precipitation: number;
  surface_pressure: number;
  cloud_cover: number;
  visibility: number;
  dew_point_2m: number;
}

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  relative_humidity_2m: number[];
  uv_index: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
  uv_index_max: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

// Air Quality API response types
interface AirQualityCurrent {
  time: string;
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
  european_aqi: number;
  us_aqi: number;
}

interface AirQualityResponse {
  current: AirQualityCurrent;
}

// Fetch air quality data from Open-Meteo Air Quality API
async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityCurrent | null> {
  try {
    const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    url.searchParams.append("latitude", lat.toString());
    url.searchParams.append("longitude", lon.toString());
    url.searchParams.append("current", "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi");
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });
    
    if (!response.ok) {
      console.warn("Air quality API unavailable");
      return null;
    }
    
    const data: AirQualityResponse = await response.json();
    return data.current;
  } catch (error) {
    console.warn("Failed to fetch air quality data:", error);
    return null;
  }
}

// Fetch marine/flood data from Open-Meteo Marine API (for coastal cities)
interface MarineData {
  wave_height: number;
  wave_period: number;
  wave_direction: number;
}

async function fetchMarineData(lat: number, lon: number): Promise<MarineData | null> {
  try {
    const url = new URL("https://marine-api.open-meteo.com/v1/marine");
    url.searchParams.append("latitude", lat.toString());
    url.searchParams.append("longitude", lon.toString());
    url.searchParams.append("current", "wave_height,wave_period,wave_direction");
    
    const response = await fetch(url.toString(), {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.current;
  } catch (error) {
    console.warn("Failed to fetch marine data:", error);
    return null;
  }
}

export async function fetchWeatherData(cityKey: string) {
  // Normalize key to lowercase to match our dictionary
  const normalizedKey = cityKey.toLowerCase();
  const city = CITY_COORDINATES[normalizedKey];
  
  if (!city) {
    console.error(`City not found for key: ${cityKey} (normalized: ${normalizedKey})`);
    // Fallback to Melbourne if city not found to prevent crashes
    const fallbackCity = CITY_COORDINATES["melbourne"];
    return fetchForCoordinates(fallbackCity, "melbourne");
  }

  return fetchForCoordinates(city, normalizedKey);
}

async function fetchForCoordinates(city: { lat: number; lon: number; name: string; timezone: string }, cityKey: string) {
  // Build the weather API URL with enhanced parameters
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.append("latitude", city.lat.toString());
  url.searchParams.append("longitude", city.lon.toString());
  url.searchParams.append("current", [
    "temperature_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "weather_code",
    "relative_humidity_2m",
    "apparent_temperature",
    "uv_index",
    "precipitation",
    "surface_pressure",
    "cloud_cover",
    "visibility",
    "dew_point_2m"
  ].join(","));
  url.searchParams.append("hourly", [
    "temperature_2m",
    "weather_code",
    "relative_humidity_2m",
    "uv_index",
    "precipitation_probability",
    "wind_speed_10m",
    "wind_gusts_10m"
  ].join(","));
  url.searchParams.append("daily", [
    "temperature_2m_max",
    "temperature_2m_min",
    "weather_code",
    "precipitation_probability_max",
    "uv_index_max",
    "sunrise",
    "sunset",
    "precipitation_sum",
    "wind_speed_10m_max",
    "wind_gusts_10m_max"
  ].join(","));
  url.searchParams.append("timezone", city.timezone);
  url.searchParams.append("forecast_days", "7");

  // Fetch weather data and air quality in parallel for better performance
  const [weatherResponse, airQuality, marineData] = await Promise.all([
    fetch(url.toString(), { next: { revalidate: 300 } }),
    fetchAirQuality(city.lat, city.lon),
    // Only fetch marine data for coastal cities
    (cityKey === "sydney" || cityKey === "brisbane") ? fetchMarineData(city.lat, city.lon) : Promise.resolve(null)
  ]);

  if (!weatherResponse.ok) {
    throw new Error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
  }

  const data: OpenMeteoResponse = await weatherResponse.json();

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
      rainProb: hourly.precipitation_probability?.[index] || 0,
      windSpeed: Math.round(hourly.wind_speed_10m?.[index] || 0),
    };
  });

  // Transform daily data
  const today = new Date().getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const dailyForecast = daily.time.slice(0, 7).map((timeStr, index) => {
    const condition = WEATHER_CODE_MAP[daily.weather_code[index]] || "cloudy";
    const mood = condition === "sunny" || condition === "clear" ? "orange" :
                 condition === "rainy" || condition === "stormy" ? "gray" :
                 condition === "snow" ? "blue" : "blue";
    
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
      sunrise: daily.sunrise?.[index],
      sunset: daily.sunset?.[index],
      precipitationSum: daily.precipitation_sum?.[index] || 0,
      maxWindSpeed: Math.round(daily.wind_speed_10m_max?.[index] || 0),
      maxWindGusts: Math.round(daily.wind_gusts_10m_max?.[index] || 0),
    };
  });

  // Use actual apparent temperature from API
  const feelsLike = Math.round(current.apparent_temperature);

  // Calculate dynamic stories based on weather data with enhanced metrics
  const stories = calculateDynamicStories(cityKey, {
    temp: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windGusts: current.wind_gusts_10m,
    rainProb: daily.precipitation_probability_max?.[0] || 0,
    uvIndex: current.uv_index,
    condition: currentCondition,
    pressure: current.surface_pressure,
    visibility: current.visibility,
    cloudCover: current.cloud_cover,
    dewPoint: current.dew_point_2m,
    airQuality,
    marineData,
    precipitationSum: daily.precipitation_sum?.[0] || 0,
    maxWindGusts: daily.wind_gusts_10m_max?.[0] || 0,
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
      pressure: Math.round(current.surface_pressure),
      visibility: Math.round(current.visibility / 1000), // Convert to km
      cloudCover: current.cloud_cover,
      dewPoint: Math.round(current.dew_point_2m),
      windGusts: Math.round(current.wind_gusts_10m),
    },
    hourly: hourlyForecast,
    daily: dailyForecast,
    stories,
    airQuality: airQuality ? {
      aqi: airQuality.us_aqi,
      pm25: Math.round(airQuality.pm2_5),
      pm10: Math.round(airQuality.pm10),
    } : null,
  };
}

// Calculate dynamic stories based on real weather data
function calculateDynamicStories(cityKey: string, weather: {
  temp: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  rainProb: number;
  uvIndex: number;
  condition: string;
  pressure: number;
  visibility: number;
  cloudCover: number;
  dewPoint: number;
  airQuality: AirQualityCurrent | null;
  marineData: MarineData | null;
  precipitationSum: number;
  maxWindGusts: number;
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
    // Tram Delay Likelihood - based on weather conditions (enhanced)
    let tramDelay = "Low";
    let tramColor = "text-green-500";
    let tramDelayScore = 0;
    
    // Factor in multiple weather conditions
    if (weather.condition === "stormy") tramDelayScore += 4;
    else if (weather.condition === "rainy") tramDelayScore += 2;
    if (weather.windSpeed > 40) tramDelayScore += 3;
    else if (weather.windSpeed > 25) tramDelayScore += 1;
    if (weather.windGusts > 60) tramDelayScore += 2;
    if (weather.visibility < 1000) tramDelayScore += 2; // Poor visibility
    if (weather.precipitationSum > 10) tramDelayScore += 2; // Heavy rain accumulation
    
    if (tramDelayScore >= 5) {
      tramDelay = "High";
      tramColor = "text-red-500";
    } else if (tramDelayScore >= 2) {
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

    // Yarra River Conditions (based on rainfall)
    let yarraStatus = "Normal";
    let yarraColor = "text-blue-500";
    if (weather.precipitationSum > 30) {
      yarraStatus = "High";
      yarraColor = "text-red-500";
    } else if (weather.precipitationSum > 15 || weather.rainProb > 70) {
      yarraStatus = "Elevated";
      yarraColor = "text-yellow-500";
    }
    stories.push({
      title: "Yarra River Level",
      value: yarraStatus,
      type: "text",
      color: yarraColor,
    });

    // Bushfire Danger (Melbourne/Victoria is bushfire prone)
    // Only show in fire season or when conditions are dangerous
    const month = new Date().getMonth();
    const isFireSeason = month >= 10 || month <= 2; // Nov-Mar
    
    let fireDanger = 0;
    if (weather.temp > 35) fireDanger += 4;
    else if (weather.temp > 30) fireDanger += 3;
    else if (weather.temp > 25) fireDanger += 2;
    
    if (weather.humidity < 20) fireDanger += 4;
    else if (weather.humidity < 30) fireDanger += 3;
    else if (weather.humidity < 40) fireDanger += 2;
    
    if (weather.windSpeed > 50) fireDanger += 3;
    else if (weather.windSpeed > 35) fireDanger += 2;
    else if (weather.windSpeed > 25) fireDanger += 1;
    
    if (isFireSeason || fireDanger >= 6) {
      let fireLevel = "Low";
      let fireColor = "text-green-500";
      
      if (fireDanger >= 10) {
        fireLevel = "Catastrophic";
        fireColor = "text-red-600";
      } else if (fireDanger >= 8) {
        fireLevel = "Extreme";
        fireColor = "text-red-500";
      } else if (fireDanger >= 6) {
        fireLevel = "Severe";
        fireColor = "text-orange-500";
      } else if (fireDanger >= 4) {
        fireLevel = "High";
        fireColor = "text-yellow-500";
      } else if (fireDanger >= 2) {
        fireLevel = "Moderate";
        fireColor = "text-blue-500";
      }
      
      stories.push({
        title: "Bushfire Danger",
        value: fireLevel,
        type: "text",
        color: fireColor,
      });
    }
  }

  if (cityKey === "sydney") {
    // Beach Day Score (enhanced with marine data)
    let beachScore = 10;
    if (weather.condition === "rainy" || weather.condition === "stormy") beachScore -= 5;
    if (weather.temp < 20) beachScore -= 2;
    if (weather.temp < 18) beachScore -= 1;
    if (weather.windSpeed > 30) beachScore -= 2;
    if (weather.uvIndex > 10) beachScore -= 1; // Too dangerous
    if (weather.marineData && weather.marineData.wave_height > 2) beachScore -= 1; // Rough seas
    beachScore = Math.max(0, Math.min(10, beachScore));
    
    stories.push({
      title: "Beach Day Score",
      value: `${beachScore}/10`,
      type: "bar",
      color: beachScore > 7 ? "bg-yellow-500" : beachScore > 4 ? "bg-orange-400" : "bg-gray-400",
    });

    // Surf Conditions (if marine data available)
    if (weather.marineData) {
      const waveHeight = weather.marineData.wave_height;
      let surfCondition = "Flat";
      let surfColor = "text-gray-400";
      if (waveHeight > 2.5) {
        surfCondition = "Epic";
        surfColor = "text-green-500";
      } else if (waveHeight > 1.5) {
        surfCondition = "Good";
        surfColor = "text-blue-500";
      } else if (waveHeight > 0.5) {
        surfCondition = "Okay";
        surfColor = "text-yellow-500";
      }
      stories.push({
        title: "Surf Conditions",
        value: surfCondition,
        type: "text",
        color: surfColor,
      });
    }

    // Humidity with comfort level
    const humidityComfort = weather.humidity > 80 ? "Oppressive" : 
                           weather.humidity > 70 ? "Uncomfortable" : 
                           weather.humidity > 50 ? "Moderate" : "Comfortable";
    stories.push({
      title: "Humidity",
      value: humidityComfort,
      type: "text",
      color: weather.humidity > 80 ? "text-red-400" : 
             weather.humidity > 70 ? "text-orange-400" : 
             weather.humidity > 50 ? "text-yellow-400" : "text-green-400",
    });

    // Bushfire Danger (Sydney/NSW is very bushfire prone - Black Summer 2019-2020)
    const month = new Date().getMonth();
    const isFireSeason = month >= 9 || month <= 2; // Oct-Mar (longer season for NSW)
    
    let fireDanger = 0;
    if (weather.temp > 38) fireDanger += 4;
    else if (weather.temp > 32) fireDanger += 3;
    else if (weather.temp > 28) fireDanger += 2;
    
    if (weather.humidity < 15) fireDanger += 4;
    else if (weather.humidity < 25) fireDanger += 3;
    else if (weather.humidity < 35) fireDanger += 2;
    
    if (weather.windSpeed > 50) fireDanger += 3;
    else if (weather.windSpeed > 35) fireDanger += 2;
    
    if (isFireSeason || fireDanger >= 6) {
      let fireLevel = "Low";
      let fireColor = "text-green-500";
      
      if (fireDanger >= 10) {
        fireLevel = "Catastrophic";
        fireColor = "text-red-600";
      } else if (fireDanger >= 8) {
        fireLevel = "Extreme";
        fireColor = "text-red-500";
      } else if (fireDanger >= 6) {
        fireLevel = "Severe";
        fireColor = "text-orange-500";
      } else if (fireDanger >= 4) {
        fireLevel = "High";
        fireColor = "text-yellow-500";
      } else if (fireDanger >= 2) {
        fireLevel = "Moderate";
        fireColor = "text-blue-500";
      }
      
      stories.push({
        title: "Bushfire Danger",
        value: fireLevel,
        type: "text",
        color: fireColor,
      });
    }
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

    // Storm Risk (enhanced)
    let stormRisk = "Low";
    let stormColor = "text-green-500";
    let stormScore = 0;
    
    if (weather.condition === "stormy") stormScore += 4;
    if (weather.humidity > 75) stormScore += 1;
    if (weather.rainProb > 60) stormScore += 2;
    if (weather.pressure < 1010) stormScore += 1; // Low pressure system
    if (weather.temp > 30 && weather.humidity > 60) stormScore += 2; // Thunderstorm conditions
    
    if (stormScore >= 5) {
      stormRisk = "High";
      stormColor = "text-purple-500";
    } else if (stormScore >= 2) {
      stormRisk = "Moderate";
      stormColor = "text-yellow-500";
    }
    
    stories.push({
      title: "Storm Risk",
      value: stormRisk,
      type: "text",
      color: stormColor,
    });

    // Brisbane River Level (enhanced with precipitation data)
    let riverStatus = "Normal";
    let riverColor = "text-blue-500";
    if (weather.precipitationSum > 50) {
      riverStatus = "Flood Watch";
      riverColor = "text-red-500";
    } else if (weather.precipitationSum > 25 || weather.rainProb > 80) {
      riverStatus = "Rising";
      riverColor = "text-orange-500";
    } else if (weather.precipitationSum > 10 || weather.rainProb > 60) {
      riverStatus = "Elevated";
      riverColor = "text-yellow-500";
    }
    stories.push({
      title: "River Level",
      value: riverStatus,
      type: "text",
      color: riverColor,
    });
  }

  if (cityKey === "tasmania") {
    // Fireplace Index - based on temperature, wind, and humidity
    let fireplaceIndex = 0;
    if (weather.temp < 8) fireplaceIndex = 10;
    else if (weather.temp < 12) fireplaceIndex = 9;
    else if (weather.temp < 15) fireplaceIndex = 7;
    else if (weather.temp < 18) fireplaceIndex = 5;
    else if (weather.temp < 22) fireplaceIndex = 3;
    else fireplaceIndex = 1;
    
    // Wind chill factor
    if (weather.windSpeed > 30) fireplaceIndex = Math.min(10, fireplaceIndex + 2);
    else if (weather.windSpeed > 20) fireplaceIndex = Math.min(10, fireplaceIndex + 1);
    
    // Humidity factor (dry air feels colder)
    if (weather.humidity < 40) fireplaceIndex = Math.min(10, fireplaceIndex + 1);
    
    stories.push({
      title: "Fireplace Index",
      value: `${fireplaceIndex}/10`,
      type: "bar",
      color: fireplaceIndex > 7 ? "bg-orange-600" : fireplaceIndex > 4 ? "bg-orange-400" : "bg-yellow-400",
    });

    // Aurora Chance (enhanced - better in winter, clear skies, low light pollution)
    let auroraChance = "Low";
    let auroraColor = "text-gray-400";
    const month = new Date().getMonth();
    const isWinter = month >= 4 && month <= 8; // May to September
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 5;
    
    if (isWinter && weather.condition === "clear" && weather.cloudCover < 20) {
      if (isNight) {
        auroraChance = "Good";
        auroraColor = "text-green-500";
      } else {
        auroraChance = "Possible";
        auroraColor = "text-green-400";
      }
    } else if (weather.condition === "clear" && weather.cloudCover < 30) {
      auroraChance = "Low";
      auroraColor = "text-yellow-400";
    }
    
    stories.push({
      title: "Aurora Chance",
      value: auroraChance,
      type: "text",
      color: auroraColor,
    });

    // Oyster Quality (seasonal - best in cooler months)
    const oysterSeason = month >= 3 && month <= 10; // April to November
    stories.push({
      title: "Oyster Quality",
      value: oysterSeason ? "Peak" : "Good",
      type: "text",
      color: oysterSeason ? "text-teal-500" : "text-teal-400",
    });

    // Hiking Conditions
    let hikingScore = 10;
    if (weather.condition === "rainy" || weather.condition === "stormy") hikingScore -= 4;
    if (weather.condition === "snow") hikingScore -= 3;
    if (weather.windSpeed > 40) hikingScore -= 3;
    if (weather.visibility < 5000) hikingScore -= 2;
    if (weather.temp < 5) hikingScore -= 2;
    hikingScore = Math.max(0, Math.min(10, hikingScore));
    
    stories.push({
      title: "Hiking Conditions",
      value: hikingScore >= 7 ? "Excellent" : hikingScore >= 5 ? "Good" : hikingScore >= 3 ? "Fair" : "Poor",
      type: "text",
      color: hikingScore >= 7 ? "text-green-500" : hikingScore >= 5 ? "text-blue-500" : hikingScore >= 3 ? "text-yellow-500" : "text-red-500",
    });
  }

  // UV Index for all cities (Australia is notorious for UV!)
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
