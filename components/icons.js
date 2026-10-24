// Small inline stroke icons (no icon library needed).
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5c3.6 4.4 6.5 8 6.5 11.5a6.5 6.5 0 0 1-13 0c0-3.5 2.9-7.1 6.5-11.5z" fill="#0F766E" />
      <path d="M9 14.2l2.1 2.1L15.2 12" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon(p) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M12 21s-6-5.4-6-10a6 6 0 0 1 12 0c0 4.6-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

export function ScanIcon(p) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </svg>
  );
}

export function TrophyIcon(p) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
    </svg>
  );
}

export function DeviceIcon(p) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10 6h4" />
      <circle cx="12" cy="16" r="2" />
    </svg>
  );
}

export function HelpIcon(p) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2-2.1 3.4M12 17h.01" />
    </svg>
  );
}

export function LocateIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}

export function CheckIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...base} strokeWidth="2.4" {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CloseIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SearchIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function FilterIcon(p) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...base} {...p}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}
