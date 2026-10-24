import { SITE_URL } from '@/lib/status';

export default function sitemap() {
  const now = new Date();
  return ['', '/test', '/top', '/get', '/how', '/terms', '/privacy', '/grievance'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/top' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }));
}
