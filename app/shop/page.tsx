import { getProducts } from "@/lib/shopify";
import BoutiqueCatalog from "@/components/shop/BoutiqueCatalog";

export const metadata = {
  title: "Boutique Shop | Don Perro Premium Pet Store",
  description: "Curated premium pet essentials, including toys, organic feeds, dining accessories, and memory foam comfort dog beds.",
};

export default async function ShopPage() {
  // Fetch products on server side securely
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-background">
      <BoutiqueCatalog initialProducts={products} />
    </main>
  );
}
