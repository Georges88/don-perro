import Link from "next/link";
import { getFeaturedProducts } from "@/lib/shopify";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductCardActions from "@/components/shop/ProductCardActions";
import ProductSalePrice from "@/components/shop/ProductSalePrice";

export default async function FeaturedProducts() {
  const products = (await getFeaturedProducts()).slice(0, 4);

  return (
    <section id="featured-products" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-16">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold font-heading text-on-background tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-secondary mt-1">
              Handpicked essentials for comfort, health, and style.
            </p>
          </div>
          <Link href="/shop?tag=featured" className="text-sm font-bold text-primary hover:underline group flex items-center gap-1">
            View All Products
            <span className="transition-transform duration-200 group-hover:translate-x-1">-&gt;</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const hasSale = product.tags.includes("sale");

            return (
              <div key={product.id} className="group flex flex-col relative">

                {/* Image Container with Floating Interactions */}
                <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-[0px_5px_15px_rgba(90,96,90,0.03)] group-hover:shadow-[0px_15px_35px_rgba(90,96,90,0.08)] transition-all duration-300 relative">
                  <Link href={`/products/${product.handle}`} className="block w-full h-full cursor-pointer">
                    <img
                      className="block w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      loading="lazy"
                    />
                  </Link>
                  <ProductCardActions product={product} className="absolute right-3 top-3 z-10" />

                  {/* Floating Action Button */}
                  <AddToCartButton
                    product={product}
                    className="absolute bottom-3.5 right-3.5 bg-white w-10 h-10 rounded-full flex items-center justify-center text-primary shadow-md hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer z-10"
                  />

                  {/* Badges */}
                  {hasSale && (
                    <span className="absolute top-3.5 left-3.5 bg-error text-white text-[10px] uppercase px-2 py-0.5 rounded-md font-bold tracking-wider">
                      Sale
                    </span>
                  )}
                </div>

                {/* Details */}
                <Link href={`/products/${product.handle}`} className="mt-4 flex flex-col flex-grow cursor-pointer">
                  <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                    {product.productType}
                  </span>
                  <h3 className="text-sm font-bold text-on-surface hover:text-primary transition-colors mt-1 font-sans line-clamp-2">
                    {product.title}
                  </h3>
                  <ProductSalePrice
                    product={product}
                    className="mt-auto flex flex-wrap items-baseline gap-2 pt-1"
                    priceClassName="text-sm font-bold text-primary"
                    originalPriceClassName="text-xs text-outline line-through"
                  />
                </Link>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
