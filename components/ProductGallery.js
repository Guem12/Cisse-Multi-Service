"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name, inStock }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = images?.[selectedIndex]?.url || images?.[0]?.url;

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto md:max-w-none">
      {/* Image principale aux proportions maîtrisées */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white dark:bg-[#141D3D] border border-indigo/10 dark:border-white/10 shadow-sm">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            priority
            sizes="(min-width: 768px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-indigo/40 dark:text-white/40 text-sm">
            Photo à venir
          </div>
        )}

        {/* Badge stock */}
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-extrabold shadow-md backdrop-blur-sm ${
            inStock ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {inStock ? "EN STOCK" : "RUPTURE"}
        </span>
      </div>

      {/* Miniatures si plusieurs images */}
      {images && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.url || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedIndex === idx
                  ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-105"
                  : "border-transparent opacity-70 hover:opacity-100 bg-white dark:bg-[#141D3D]"
              }`}
            >
              <Image
                src={img.url}
                alt={`${name} miniature ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
