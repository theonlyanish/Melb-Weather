import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Main page
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
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
