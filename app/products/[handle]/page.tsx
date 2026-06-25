import { getProducts, getProductByHandle } from "@/lib/shopify";
import ProductDetails from "@/components/shop/ProductDetails";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    handle: product.handle,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductByHandle(resolvedParams.handle);
  
  if (!product) {
    return {
      title: "Product Not Found | Don Perro Boutique",
      description: "Discovered premium essentials suited for complete companion longevity."
    };
  }

  return {
    title: `${product.title} | Don Perro Premium Pet Store`,
    description: product.description,
    openGraph: {
      title: `${product.title} | Don Perro`,
      description: product.description,
      images: [
        {
          url: product.featuredImage.url,
          width: 800,
          height: 800,
          alt: product.featuredImage.altText || product.title,
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductByHandle(resolvedParams.handle);
  const allProducts = await getProducts();

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none">
        <Info className="w-12 h-12 text-primary/70 mb-4 animate-pulse" />
        <h1 className="text-3xl font-heading font-extrabold text-[#191c1c] mb-2">
          Product Not Found
        </h1>
        <p className="text-sm text-secondary max-w-sm mb-6 leading-relaxed">
          The requested premium pet product does not seem to be present in our boutique catalog.
        </p>
        <Link 
          href="/shop" 
          className="bg-primary text-white text-xs font-bold px-6 py-3 rounded-full hover:scale-102 hover:bg-opacity-95 shadow transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Boutique Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <ProductDetails product={product} allProducts={allProducts} />
    </main>
  );
}
