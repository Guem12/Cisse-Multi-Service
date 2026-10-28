import DashboardStats from "@/components/admin/DashboardStats";
import { getCategories, getProducts } from "@/lib/data";
import { getHeroShowcase } from "@/lib/hero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tableau de bord · Administration Cissé Multi-Service",
};

export default async function AdminDashboardPage() {
  const [products, categories, heroSlots] = await Promise.all([
    getProducts({ includeInactive: true }),
    getCategories(),
    getHeroShowcase(),
  ]);

  return (
    <DashboardStats
      products={products}
      categories={categories}
      heroSlots={heroSlots}
    />
  );
}
