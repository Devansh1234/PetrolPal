'use client';
import dynamic from 'next/dynamic';

// The map uses browser-only APIs, so it loads on the client.
const MapExplorer = dynamic(() => import('./MapExplorer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100dvh-65px-64px)] items-center justify-center bg-[#E8EEF1] text-stone-600 md:h-[calc(100dvh-65px)]">
      Loading map…
    </div>
  ),
});

export default function MapLoader() {
  return <MapExplorer />;
}
