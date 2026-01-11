import { MetadataRoute } from 'next';
import weatherData from '@/data/cities.json';
import { WeatherData } from '@/data/types';

export default function sitemap(): MetadataRoute.Sitemap {
  const typedWeatherData = weatherData as unknown as WeatherData;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localsky.app';
  
  // Main page
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];
  
  // Add city-specific pages if you plan to have them
  // For now, we'll just include the main page since it's a single-page app
  // You can expand this later if you add city-specific routes
  
  return routes;
}

