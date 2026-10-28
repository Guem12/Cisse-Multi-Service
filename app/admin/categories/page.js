import CategoriesManager from "@/components/admin/CategoriesManager";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">Catégories</h1>
      <CategoriesManager categories={await getCategories()} />
    </>
  );
}
