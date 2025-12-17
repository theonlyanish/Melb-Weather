export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  chanceRain: number;
  windSpeed: number;
  windDir: string;
  condition: string;
  humidity?: number;
  uvIndex?: number;
  pressure?: number;
  visibility?: number;
  cloudCover?: number;
  dewPoint?: number;
  windGusts?: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  isPeak: boolean;
  rainProb?: number;
  windSpeed?: number;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  rainProb: number;
  mood: string;
  sunrise?: string;
  sunset?: string;
  precipitationSum?: number;
  maxWindSpeed?: number;
  maxWindGusts?: number;
}

export interface WeatherStory {
  title: string;
  value: string;
  type: string;
  color: string;
}

export interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
}

export interface StateData {
  name: string;
  state: string;
  regionalCities: string[];
  microtext: string[];
  stories: WeatherStory[];
}

export interface LocationData {
  name: string;
  state?: string;
  current: CurrentWeather;
  microtext: string[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  stories: WeatherStory[];
  airQuality?: AirQuality | null;
  regionalCities?: string[];
}

export interface WeatherData {
  states: {
    [key: string]: StateData;
  };
}

// Legacy support
export interface CityData extends LocationData {}
