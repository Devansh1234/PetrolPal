import { SITE_URL } from '@/lib/status';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/auth', '/signin'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
