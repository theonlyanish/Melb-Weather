import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getAllCityKeys, cityKeyToSlug } from '@/lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  // One URL per city. "/" 308-redirects to /melbourne, so it isn't listed.
  return getAllCityKeys().map((key) => {
    const slug = cityKeyToSlug(key);
    return {
      url: `${SITE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: slug === 'melbourne' ? 1 : 0.8,
    };
  });
}
