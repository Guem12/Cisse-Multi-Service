"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { addToOrder } from "@/lib/cart";
import { sendWhatsAppProductOrder } from "@/lib/whatsapp";

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const img = product.images?.[0]?.url;
  const soldOut = product.stock <= 0;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_1 || "22362823995";

  function handleDirectWhatsApp(e) {
    e.preventDefault();
    e.stopPropagation();
    sendWhatsAppProductOrder({
      name: product.name,
      price: product.price,
      qty: 1,
      slug: product.slug,
      imageUrl: img,
      phone,
    });
  }

  function handleAddToOrder(e) {
    e.preventDefault();
    e.stopPropagation();
    addToOrder(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="group flex flex-col justify-between rounded-2xl p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 border" style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)'}}>
      <div>
        {/* Image avec lien produit */}
        <Link
          href={`/produit/${product.slug}`}
          className="relative block aspect-square overflow-hidden rounded-xl"
          style={{backgroundColor: 'var(--bg-subtle)'}}
        >
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs" style={{color: 'var(--text-faint)'}}>
              Photo à venir
            </div>
          )}

          {/* Badge stock */}
          <span
            className={`absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold shadow ${
              soldOut ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            {soldOut ? "RUPTURE" : "EN STOCK"}
          </span>
        </Link>

        {/* Détails du produit */}
        <div className="mt-2.5">
          {product.category?.name && (
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {product.category.name}
            </p>
          )}

          <Link href={`/produit/${product.slug}`}>
            <h3 className="mt-0.5 font-titre font-bold text-sm sm:text-base leading-tight line-clamp-2 hover:text-ocre transition-colors" style={{color: 'var(--text-main)'}}>
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 font-titre text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      {/* ── Boutons d'action demandés ── */}
      <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t" style={{borderColor: 'var(--border)'}}>
        {soldOut ? (
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-gray-100 dark:bg-white/10 py-2 text-xs font-bold text-gray-400 dark:text-white/40 cursor-not-allowed text-center"
          >
            Rupture de stock
          </button>
        ) : (
          <>
            {/* 1. Commander sur WhatsApp */}
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] py-2 px-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-all"
              title="Commander directement cet article sur WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.855L.057 23.47a.5.5 0 0 0 .606.638l5.805-1.524A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.354-1.556l-.385-.229-3.994 1.048 1.07-3.908-.252-.402A9.964 9.964 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              <span className="truncate">Commander sur WhatsApp</span>
            </button>

            {/* 2. Ajouter à ma commande */}
            <button
              type="button"
              onClick={handleAddToOrder}
              className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 px-2 text-xs sm:text-sm font-bold transition-all active:scale-[0.97] ${
                added
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-inner"
                  : "bg-gray-50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border-indigo/15 dark:border-white/15 text-indigo-deep dark:text-white shadow-sm"
              }`}
              title="Ajouter ce produit à votre liste de commande"
            >
              {added ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600 dark:text-emerald-400">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-extrabold leading-none">+</span>
                  <span className="truncate">Ajouter à ma commande</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
