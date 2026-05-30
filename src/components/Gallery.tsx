'use client';

import { useState } from 'react';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((url, i) => (
          <button
            key={url + i}
            onClick={() => setActive(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} ${i + 1}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
            aria-label="Fermer"
          >
            ✕
          </button>
          <button
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setActive((a) => (a === null ? 0 : (a - 1 + images.length) % images.length));
            }}
            aria-label="Précédent"
          >
            ‹
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={title}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setActive((a) => (a === null ? 0 : (a + 1) % images.length));
            }}
            aria-label="Suivant"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
