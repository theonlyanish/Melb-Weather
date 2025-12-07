export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  chanceRain: number;
  windSpeed: number;
  windDir: string;
  condition: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  isPeak: boolean;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  rainProb: number;
  mood: string;
}

export interface WeatherStory {
  title: string;
  value: string;
  type: string;
  color: string;
}

export interface CityData {
  name: string;
  suburbs: string[];
  current: CurrentWeather;
  microtext: string[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  stories: WeatherStory[];
}

export interface WeatherData {
  cities: {
    [key: string]: CityData;
  };
}
