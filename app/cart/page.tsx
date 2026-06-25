import { Suspense } from "react";
import { getProducts } from "@/lib/shopify";
import CartView from "@/components/cart/CartView";

export const metadata = {
  title: "Your Cart | Don Perro Premium Pet Store",
  description: "Review and manage premium accessories and organic foods in your custom cart.",
};

export default async function CartPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-background text-on-background">
      <Suspense fallback={<CartLoadingSkeleton />}>
        <CartView initialProducts={products} />
      </Suspense>
    </main>
  );
}

function CartLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-16 pt-32 pb-24 font-sans animate-pulse">
      <div className="h-10 w-48 bg-surface-container rounded-lg mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-32 bg-surface-container rounded-2xl" />
          <div className="h-32 bg-surface-container rounded-2xl" />
          <div className="pt-8 space-y-4">
            <div className="h-6 w-52 bg-surface-container rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-surface-container rounded-xl" />
                  <div className="h-3 w-12 bg-surface-container rounded" />
                  <div className="h-4 bg-surface-container rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-[400px] bg-surface-container rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
