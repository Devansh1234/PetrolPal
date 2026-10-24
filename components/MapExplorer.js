'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '@/lib/supabase/client';
import { STATUS, STATUS_ORDER, BRAND_ORDER, formatDistance, placeLine } from '@/lib/status';
import { LocateIcon, CloseIcon, SearchIcon, FilterIcon, ScanIcon } from './icons';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const UNKNOWN_COLOR = '#A8A29E';

function distanceM(a, b) {
  const R = 6371000;
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toGeoJSON(list, colorOf, weightOf) {
  return {
    type: 'FeatureCollection',
    features: list.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { i: p.i, c: colorOf(p), w: weightOf(p) },
    })),
  };
}

export default function MapExplorer() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const [query, setQuery] = useState('');
  const [q, setQ] = useState('');
  const [stateName, setStateName] = useState('');
  const [offBrands, setOffBrands] = useState(() => new Set());
  const [offStatus, setOffStatus] = useState(() => new Set());
  const [me, setMe] = useState(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const quality = data?.mode === 'quality';

  // Load stations (one request, ~19k rows).
  useEffect(() => {
    let cancelled = false;
    createClient()
      .rpc('pumps_map')
      .then(({ data: d, error }) => {
        if (cancelled) return;
        if (error || !d) {
          setLoadError(true);
          return;
        }
        const brands = {};
        for (const b of d.brands || []) brands[b.slug] = b;
        const pumps = (d.pumps || []).map(([id, lat, lng, b, name, city, district, state, s], i) => ({
          i, id, lat, lng, b, name, city, district, state, s: s || 'insufficient',
          hay: `${name} ${city || ''} ${district || ''}`.toLowerCase(),
        }));
        const used = new Set(pumps.map((p) => p.b));
        for (const slug of Object.keys(brands)) if (!used.has(slug)) delete brands[slug];
        setData({ mode: d.mode, brands, pumps });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Create the map once.
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapEl.current,
      style: MAP_STYLE,
      center: [79.5, 22.8],
      zoom: 3.9,
      minZoom: 3.2,
      maxZoom: 18,
      maxBounds: [[58, 0], [104, 40]],
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('load', () => setMapReady(true));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Debounce search typing.
  useEffect(() => {
    const t = setTimeout(() => setQ(query.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [query]);

  const matchesBase = (p) => (!stateName || p.state === stateName) && (!q || p.hay.includes(q));

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.pumps.filter(
      (p) => matchesBase(p) && !offBrands.has(p.b) && (!quality || !offStatus.has(p.s)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, stateName, offBrands, offStatus, quality]);

  const counts = useMemo(() => {
    const brand = {};
    const status = {};
    if (data) {
      for (const p of data.pumps) {
        if (!matchesBase(p)) continue;
        brand[p.b] = (brand[p.b] || 0) + 1;
        status[p.s] = (status[p.s] || 0) + 1;
      }
    }
    return { brand, status };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, stateName]);

  const states = useMemo(
    () => (data ? [...new Set(data.pumps.map((p) => p.state))].filter(Boolean).sort() : []),
    [data],
  );

  const brandSlugs = useMemo(() => {
    if (!data) return [];
    const known = BRAND_ORDER.filter((s) => data.brands[s]);
    return known.concat(Object.keys(data.brands).filter((s) => !BRAND_ORDER.includes(s)));
  }, [data]);

  const nearest = useMemo(() => {
    if (!me) return [];
    return filtered
      .map((p) => [distanceM(me, p), p])
      .sort((a, b) => a[0] - b[0])
      .slice(0, 8);
  }, [me, filtered]);

  // Add map layers once data and map are both ready.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data || map.getSource('pumps')) return;
    map.addSource('pumps', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterRadius: 44,
      clusterMaxZoom: 11,
    });
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'pumps',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#0F766E',
        'circle-opacity': 0.88,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-radius': ['step', ['get', 'point_count'], 14, 50, 18, 250, 23, 1000, 29],
      },
    });
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'pumps',
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12, 'text-font': ['Noto Sans Regular'] },
      paint: { 'text-color': '#ffffff' },
    });
    map.addLayer({
      id: 'points',
      type: 'circle',
      source: 'pumps',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'c'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, ['*', 4, ['get', 'w']], 14, ['*', 7, ['get', 'w']], 17, ['*', 10, ['get', 'w']]],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
    });

    map.on('click', 'clusters', async (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
      const zoom = await map.getSource('pumps').getClusterExpansionZoom(f.properties.cluster_id);
      map.easeTo({ center: f.geometry.coordinates, zoom });
    });
    map.on('click', 'points', (e) => {
      const i = e.features[0].properties.i;
      setSelected(data.pumps[i]);
    });
    for (const layer of ['clusters', 'points']) {
      map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
    }
  }, [mapReady, data]);

  // Push filtered points to the map.
  useEffect(() => {
    const src = mapRef.current?.getSource('pumps');
    if (!src || !data) return;
    const colorOf = quality
      ? (p) => STATUS[p.s]?.color || STATUS.insufficient.color
      : (p) => data.brands[p.b]?.color || UNKNOWN_COLOR;
    const weightOf = quality ? (p) => (p.s === 'insufficient' ? 0.75 : 1.15) : () => 1;
    src.setData(toGeoJSON(filtered, colorOf, weightOf));
  }, [filtered, data, quality, mapReady]);

  function fitTo(list) {
    const map = mapRef.current;
    if (!map || !list.length) return;
    const bb = new maplibregl.LngLatBounds();
    list.forEach((p) => bb.extend([p.lng, p.lat]));
    map.fitBounds(bb, { padding: 60, maxZoom: 12 });
  }

  function onStateChange(value) {
    setStateName(value);
    if (value && data) fitTo(data.pumps.filter((p) => p.state === value));
  }

  function toggle(setter, key) {
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function locate() {
    if (!navigator.geolocation) {
      setNotice('Location isn’t available in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMe(here);
        setLocating(false);
        setPanelOpen(true);
        mapRef.current?.flyTo({ center: [here.lng, here.lat], zoom: 13 });
      },
      () => {
        setLocating(false);
        setNotice('We couldn’t get your location. Allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // "Me" marker
  const meMarker = useRef(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !me) return;
    if (!meMarker.current) {
      const el = document.createElement('div');
      el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.2)';
      el.setAttribute('aria-label', 'You are here');
      meMarker.current = new maplibregl.Marker({ element: el });
    }
    meMarker.current.setLngLat([me.lng, me.lat]).addTo(map);
  }, [me, mapReady]);

  function openPump(p) {
    setSelected(p);
    mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 15 });
    setPanelOpen(false);
  }

  const total = data?.pumps.length || 0;
  const selBrand = selected ? data?.brands[selected.b] : null;

  const panel = (
    <div className="flex flex-col gap-5">
      <div className="hidden flex-col gap-1 md:flex">
        <h2 className="text-2xl font-bold leading-tight tracking-tight">
          {quality ? 'Is the petrol near you as expected?' : 'Find a petrol pump near you'}
        </h2>
        <p className="text-stone-600">
          {data
            ? `${total.toLocaleString('en-IN')} pumps across ${states.length} states and UTs. Tap any pump for details.`
            : 'Loading pumps…'}
        </p>
      </div>

      <label className="label hidden md:flex">
        Search
        <input
          type="search"
          className="field font-normal"
          placeholder="Pump name, city or district"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <button type="button" className="btn-primary hidden md:inline-flex" onClick={locate} disabled={locating}>
        <LocateIcon />
        {locating ? 'Finding you…' : 'Show pumps near me'}
      </button>

      <label className="label">
        State
        <select className="field font-normal" value={stateName} onChange={(e) => onStateChange(e.target.value)}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      {quality && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-stone-700">Test results · tap to hide or show</legend>
          {STATUS_ORDER.map((k) => {
            const on = !offStatus.has(k);
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(setOffStatus, k)}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${
                  on ? 'border-stone-300 bg-white' : 'border-stone-200 bg-stone-100 opacity-60'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 flex-none rounded-full"
                  style={
                    k === 'insufficient'
                      ? { border: '2px solid #A8A29E', background: '#F5F5F4' }
                      : { background: STATUS[k].color }
                  }
                />
                <span className="flex flex-1 flex-col">
                  <strong className="text-sm">{STATUS[k].short}</strong>
                  <span className="text-[12.5px] text-stone-600">{STATUS[k].help}</span>
                </span>
                <span className="text-[13px] tabular-nums text-stone-500">{(counts.status[k] || 0).toLocaleString('en-IN')}</span>
              </button>
            );
          })}
        </fieldset>
      )}

      <fieldset className="flex flex-col">
        <legend className="mb-2 flex w-full justify-between text-sm font-semibold text-stone-700">
          <span>
            Brand <span className="font-normal text-stone-500">· tap to hide or show</span>
          </span>
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {brandSlugs.map((slug) => {
            const b = data.brands[slug];
            const on = !offBrands.has(slug);
            return (
              <button
                key={slug}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(setOffBrands, slug)}
                className={`chip ${on ? 'border-stone-300 bg-white text-stone-900' : 'border-stone-200 bg-stone-100 text-stone-400 line-through'}`}
              >
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: on ? b.color : '#D6D3D1' }} />
                {b.short_name || b.short}
                <span className="tabular-nums text-stone-500 no-underline">{(counts.brand[slug] || 0).toLocaleString('en-IN')}</span>
              </button>
            );
          })}
        </div>
        {(offBrands.size > 0 || offStatus.size > 0) && (
          <button
            type="button"
            className="mt-2 self-start text-sm font-semibold text-pal-700"
            onClick={() => {
              setOffBrands(new Set());
              setOffStatus(new Set());
            }}
          >
            Show all
          </button>
        )}
      </fieldset>

      <p className="text-[13px] text-stone-600">
        Showing <strong className="text-stone-900">{filtered.length.toLocaleString('en-IN')}</strong> pumps
      </p>

      {me && (
        <section aria-label="Nearest pumps" className="flex flex-col">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Nearest pumps</h2>
          <ul>
            {nearest.length === 0 && <li className="py-2 text-stone-600">No pumps match these filters.</li>}
            {nearest.map(([d, p]) => (
              <li key={p.id} className="border-t border-stone-200">
                <button type="button" onClick={() => openPump(p)} className="flex w-full items-baseline gap-3 py-2.5 text-left">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ background: quality ? STATUS[p.s].color : data.brands[p.b]?.color || UNKNOWN_COLOR }}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{p.name}</span>
                    <span className="truncate text-xs text-stone-600">{[p.city, p.state].filter(Boolean).join(', ')}</span>
                  </span>
                  <span className="flex-none text-xs tabular-nums text-stone-600">{formatDistance(d)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/test" className="mt-auto flex items-center gap-3 rounded-xl bg-stone-100 p-3.5 text-stone-900 no-underline hover:text-stone-900">
        <ScanIcon width="32" height="32" className="flex-none text-pal-700" />
        <span className="flex flex-col">
          <strong className="text-sm">Have a Petrol Pal tester?</strong>
          <span className="text-[13px] text-stone-600">Scan its QR code to add your test to the map →</span>
        </span>
      </Link>
    </div>
  );

  return (
    <div className="relative flex h-[calc(100dvh-65px-64px)] md:h-[calc(100dvh-65px)]">
      {/* Desktop side panel */}
      <aside aria-label="Find a pump" className="hidden w-[360px] flex-none overflow-y-auto border-r border-stone-200 bg-white p-6 md:block">
        {data ? panel : <p className="text-stone-600">{loadError ? 'Couldn’t load pumps. Please refresh.' : 'Loading pumps…'}</p>}
      </aside>

      <section aria-label="Map" className="relative min-w-0 flex-1 bg-[#E8EEF1]">
        {/* Inline style: MapLibre's CSS sets position:relative on the container, which would override a class. */}
        <div ref={mapEl} style={{ position: 'absolute', inset: 0 }} />

        {/* Mobile: search bar + buttons over the map */}
        <div className="absolute inset-x-3 top-3 z-10 flex flex-col gap-2 md:hidden">
          <label className="flex h-12 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 shadow-sm">
            <SearchIcon className="text-stone-500" />
            <span className="sr-only">Search pumps</span>
            <input
              type="search"
              className="flex-1 bg-transparent text-[15px] outline-none"
              placeholder="Search pump, city or district"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={locate} disabled={locating} className="btn-primary min-h-[40px] flex-1 py-2 shadow-sm">
              <LocateIcon />
              {locating ? 'Finding you…' : 'Near me'}
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              className="btn-secondary min-h-[40px] flex-1 py-2 shadow-sm"
            >
              <FilterIcon />
              Filters{offBrands.size + offStatus.size + (stateName ? 1 : 0) > 0 ? ' •' : ''}
            </button>
          </div>
        </div>

        {/* Legend (desktop) */}
        {data && (
          <div className="absolute left-4 top-4 z-10 hidden rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] text-stone-700 shadow-sm md:block">
            {quality ? (
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {STATUS_ORDER.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS[k].color }} />
                    {STATUS[k].short}
                  </span>
                ))}
              </span>
            ) : (
              <span>
                <strong className="text-stone-900">Pins show brand.</strong> Test results are on each pump’s page.
              </span>
            )}
          </div>
        )}

        {!data && (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-4 py-3 shadow">
            {loadError ? 'Couldn’t load pumps. Please refresh.' : 'Loading pumps…'}
          </div>
        )}

        {notice && (
          <div role="status" className="absolute left-1/2 top-32 z-20 -translate-x-1/2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm text-white shadow md:top-6">
            {notice}
          </div>
        )}

        {/* Selected pump card */}
        {selected && (
          <div
            role="dialog"
            aria-label={selected.name}
            className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-xl md:inset-x-auto md:bottom-6 md:left-6 md:w-[320px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-stone-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: selBrand?.color || UNKNOWN_COLOR }} />
                  {selBrand?.name || 'Unknown brand'}
                </span>
                <strong className="truncate text-[17px]">{selected.name}</strong>
                <span className="text-[13px] text-stone-600">{placeLine(selected)}</span>
              </div>
              <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="-m-1 p-2 text-stone-500">
                <CloseIcon />
              </button>
            </div>
            {quality ? (
              <span
                className="self-start rounded-full px-3 py-1 text-[13px] font-semibold"
                style={
                  selected.s === 'consistent'
                    ? { background: '#0F766E', color: '#fff' }
                    : selected.s === 'no_verdict'
                      ? { background: '#EEF1F7', color: '#3F4E73' }
                      : { background: '#F5F5F4', color: '#44403C' }
                }
              >
                {STATUS[selected.s].label}
              </span>
            ) : (
              <p className="rounded-lg bg-stone-100 px-3 py-2 text-[13px] text-stone-700">See test results and visitor reviews on the pump page.</p>
            )}
            <div className="flex gap-2">
              <Link href={`/pump/${selected.id}`} className="btn-primary min-h-[42px] flex-1 py-2 text-sm">
                View pump
              </Link>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener"
                className="btn-secondary min-h-[42px] flex-1 py-2 text-sm"
              >
                Directions
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Mobile filter sheet */}
      {panelOpen && data && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 md:hidden" onClick={() => setPanelOpen(false)}>
          <div
            role="dialog"
            aria-label="Filters"
            className="max-h-[80dvh] overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <strong className="text-lg">{filtered.length.toLocaleString('en-IN')} pumps</strong>
              <button type="button" className="btn-secondary min-h-[40px] py-1.5" onClick={() => setPanelOpen(false)}>
                Done
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}
