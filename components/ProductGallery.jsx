import { useEffect, useRef, useState } from "react";
import { Image } from "@/lib/astro-compat";
import { isLowStock } from "@/lib/store";
import { optimizeCloudinaryImage } from "@/lib/image-url.mjs";

export default function ProductGallery({ images = [], name, stock = 0 }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialogRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const safeImages = images.filter((image) => image?.url);
  const active = safeImages[selectedIndex] || safeImages[0];
  const inStock = stock > 0;
  const low = isLowStock(stock);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (zoom && !dialog.open) dialog.showModal();
    if (!zoom && dialog.open) dialog.close();
  }, [zoom]);

  function step(delta) {
    if (safeImages.length < 2) return;
    setSelectedIndex((index) => (index + delta + safeImages.length) % safeImages.length);
  }

  function handleTouchStart(e) {
    if (!e.touches?.[0]) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (!touchStartX.current || !e.changedTouches?.[0]) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        step(1);
      } else {
        step(-1);
      }
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 md:max-w-none">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-indigo/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#141D3D] select-none"
      >
        {active ? (
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setZoom(true)}
            aria-label={`Agrandir la photo ${selectedIndex + 1} de ${name}`}
          >
            <Image
              src={active.url}
              alt={name}
              fill
              priority
              transformWidth={1200}
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-indigo/40 dark:text-white/40">
            Photo à venir
          </div>
        )}
        <span
          className={`pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold shadow-md ${
            !inStock ? "bg-red-600 text-white" : low ? "bg-ocre text-indigo-deep" : "bg-emerald-600 text-white"
          }`}
        >
          {!inStock ? "Rupture" : low ? "Dernières pièces" : "En stock"}
        </span>

        {safeImages.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
            {safeImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === selectedIndex ? "w-5 bg-ocre shadow" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Photos du produit">
          {safeImages.map((image, index) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              aria-label={`Photo ${index + 1} de ${name}`}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                selectedIndex === index
                  ? "border-ocre ring-2 ring-ocre/40"
                  : "border-transparent opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                loading="lazy"
                transformWidth={160}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(100%,920px)] max-w-[96vw] rounded-2xl bg-indigo-deep p-3 text-white backdrop:bg-black/75"
        onClose={() => setZoom(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setZoom(false);
        }}
      >
        <div className="flex items-center justify-between gap-3 pb-3">
          <p className="truncate text-sm font-semibold">{name}</p>
          <button type="button" className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold" onClick={() => setZoom(false)}>
            Fermer
          </button>
        </div>
        {active && (
          <img
            src={optimizeCloudinaryImage(active.url, 1600)}
            alt={name}
            className="max-h-[75vh] w-full rounded-xl object-contain"
            width="1200"
            height="1200"
          />
        )}
        {safeImages.length > 1 && (
          <div className="mt-3 flex justify-between">
            <button type="button" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold" onClick={() => step(-1)}>
              Photo précédente
            </button>
            <button type="button" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold" onClick={() => step(1)}>
              Photo suivante
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
