import { Image, Link } from "@/lib/astro-compat";

const PRODUCT_LAYOUTS = {
  1: [
    "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  ],
  2: [
    "left-[3%] top-[8%]",
    "right-[1%] bottom-[5%]",
  ],
  3: [
    "left-1/2 top-[1%] -translate-x-1/2",
    "left-[1%] bottom-[3%]",
    "right-[1%] bottom-[3%]",
  ],
  4: [
    "left-[1%] top-[4%]",
    "right-[1%] top-[4%]",
    "left-[1%] bottom-[2%]",
    "right-[1%] bottom-[2%]",
  ],
};

export default function HeroCollage({ items = [] }) {
  const displayList = items
    .filter((entry) => entry?.product && (entry.imageUrl || entry.product.images?.[0]?.url))
    .slice(0, 4);
  if (!displayList.length) return null;

  const layouts = PRODUCT_LAYOUTS[displayList.length];

  return (
    <div className="hero-collage relative mx-auto h-[310px] w-full max-w-[390px] select-none sm:h-[420px] sm:max-w-[500px] lg:h-[520px]">
      <style>{`
        .hero-collage-orb {
          background: radial-gradient(circle at 35% 30%, #F3C463 0%, #E0A030 72%, #C98419 100%);
          box-shadow: 0 0 90px rgba(224, 160, 48, 0.22);
        }
        .hero-product-photo {
          animation: hero-product-float 7s ease-in-out infinite;
        }
        .hero-floating-card {
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
        }
        @keyframes hero-product-float {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-product-photo { animation: none; }
        }
      `}</style>
      <div aria-hidden="true" className="hero-collage-orb absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]" />

      {displayList.map((entry, index) => {
        const { product } = entry;
        const image = entry.imageUrl || product.images[0].url;

        return (
          <Link
            key={product._id || product.id || product.slug}
            href={`/produit/${product.slug}`}
            aria-label={`Voir ${product.name}`}
            className={`hero-product-image absolute z-20 block h-44 w-36 sm:h-56 sm:w-44 ${layouts[index]}`}
            style={{ animationDelay: `${index * 0.7}s` }}
          >
            <Image
              src={image}
              alt={product.name}
              width={480}
              height={480}
              sizes="(max-width: 640px) 180px, 240px"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              transformWidth={480}
              srcSet={undefined}
              className="hero-product-photo h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(10,18,48,0.28)]"
            />
          </Link>
        );
      })}

    </div>
  );
}
