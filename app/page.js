import MapLoader from '@/components/MapLoader';

export default function HomePage() {
  return (
    <main>
      <h1 className="sr-only">Petrol Pal — map of petrol pumps in India</h1>
      <MapLoader />
    </main>
  );
}
