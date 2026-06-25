import { Suspense } from "react";
import { getProducts } from "@/lib/shopify";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata = {
  title: "Secure Checkout | Don Perro Premium Pet Store",
  description: "Secure and complete your purchase of premium pet supplies and organic nutrition products.",
};

export default async function CheckoutPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<CheckoutLoadingSkeleton />}>
      <CheckoutView initialProducts={products} />
    </Suspense>
  );
}

function CheckoutLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans">
      <header className="h-20 bg-surface/90 border-b border-outline-variant/10 flex items-center justify-between px-6 md:px-16" />
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 md:py-20 w-full animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-24 bg-surface-container rounded-2xl" />
            <div className="h-24 bg-surface-container rounded-2xl" />
            <div className="h-24 bg-surface-container rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-[420px] bg-surface-container rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
