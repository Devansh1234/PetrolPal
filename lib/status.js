// Public test-result statuses. Wording is deliberately neutral: the site never says a pump is bad.
export const STATUS = {
  consistent: {
    label: 'Consistent with E20',
    short: 'Consistent with E20',
    help: 'Enough tests, and they match E20',
    color: '#0F766E',
  },
  no_verdict: {
    label: 'Readings vary — no rating yet',
    short: 'Readings vary',
    help: 'Tests don’t agree yet — no rating',
    color: '#7C8DB5',
  },
  insufficient: {
    label: 'Not enough tests',
    short: 'Not enough tests',
    help: 'Fewer tests than we need so far',
    color: '#D6D3D1',
  },
};

export const STATUS_ORDER = ['consistent', 'no_verdict', 'insufficient'];

// Display order for brand filter chips.
export const BRAND_ORDER = [
  'indian-oil',
  'hindustan-petroleum',
  'bharat-petroleum',
  'nayara',
  'jio-bp',
  'shell',
  'independent',
  'unknown',
];

export function formatDate(value, withYear = true) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

export function formatDistance(m) {
  if (m == null) return '';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function placeLine(p) {
  const parts = [p.city, p.district && p.district !== p.city ? p.district : null, p.state];
  return parts.filter(Boolean).join(', ');
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://petrolpal.in';
