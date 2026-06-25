import { Suspense } from "react";
import { getProducts } from "@/lib/shopify";
import SearchResults from "@/components/search/SearchResults";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Search Results | Don Perro Premium Pet Store",
  description: "Search for premium boutique pet accessories and organic food inside Don Perro catalog.",
};

export default async function SearchPage() {
  // Fetch products database asynchronously on Server Side
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<SearchLoadingSkeleton />}>
        <SearchResults products={products} />
      </Suspense>
    </main>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-16 pt-32 pb-24 font-sans animate-pulse">
      <div className="h-9 w-64 bg-surface-container-high rounded-lg mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="h-40 bg-surface-container rounded-2xl" />
          <div className="h-32 bg-surface-container rounded-2xl" />
        </aside>
        <div className="space-y-6">
          <div className="h-14 bg-surface-container rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-surface-container rounded-2xl" />
                <div className="h-3 w-16 bg-surface-container rounded" />
                <div className="h-4 bg-surface-container rounded" />
                <div className="h-4 w-12 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
