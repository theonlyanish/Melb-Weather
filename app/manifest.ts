import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LocalSky - Australian Weather Forecast',
    short_name: 'LocalSky',
    description: 'Get accurate weather forecasts for Australian cities with real-time data, hourly forecasts, and local weather stories.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['weather', 'utilities'],
    lang: 'en-AU',
    orientation: 'portrait-primary',
  };
}

