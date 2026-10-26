'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProductCard({ name, model, blurb, points, price, earlyBird, featured, images }) {
  const [colour, setColour] = useState(images[0].id);
  const img = images.find((i) => i.id === colour);
  return (
    <article
      className={`relative flex flex-1 basis-[320px] flex-col gap-5 rounded-[28px] bg-white p-6 md:p-8 ${featured ? 'ring-2 ring-pal-700' : 'ring-1 ring-stone-200'}`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 rounded-full bg-pal-700 px-3 py-1 text-xs font-semibold text-white">Adds your tests to the map</span>
      )}
      <div className="relative flex h-[340px] items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_35%,#F7F9F8,#E3E8E6)]">
        <Image src={img.src} alt={`${name} in ${img.label}`} width={img.w} height={img.h} className="h-[300px] w-auto object-contain" sizes="(max-width: 768px) 60vw, 320px" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
        <div role="radiogroup" aria-label={`${name} colour`} className="flex gap-2">
          {images.map((i) => (
            <button
              key={i.id}
              type="button"
              role="radio"
              aria-checked={colour === i.id}
              aria-label={i.label}
              title={i.label}
              onClick={() => setColour(i.id)}
              className={`h-8 w-8 rounded-full border border-stone-300 ${colour === i.id ? 'ring-2 ring-pal-700 ring-offset-2' : ''}`}
              style={{ background: i.swatch }}
            />
          ))}
        </div>
      </div>
      <p className="-mt-2 text-stone-600">{blurb}</p>
      <ul className="flex flex-col gap-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-pal-700" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-3 border-t border-stone-200 pt-5">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight">{earlyBird}</span>
          <span className="text-stone-500 line-through decoration-stone-400">{price}</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">Early-bird</span>
        </div>
        <a href={`#waitlist-${model}`} className={featured ? 'btn-primary' : 'btn-outline'}>
          Join the waitlist for {name.replace('Petrol Pal ', '')}
        </a>
      </div>
    </article>
  );
}
