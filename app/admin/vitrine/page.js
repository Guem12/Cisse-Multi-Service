import HeroShowcaseManager from "@/components/admin/HeroShowcaseManager";
import { getProducts } from "@/lib/data";
import { getHeroShowcase } from "@/lib/hero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vitrine Accueil · Administration",
};

export default async function AdminVitrinePage() {
  const [products, initialSlots] = await Promise.all([
    getProducts({ includeInactive: true }),
    getHeroShowcase(),
  ]);

  return <HeroShowcaseManager initialSlots={initialSlots} products={products} />;
}
