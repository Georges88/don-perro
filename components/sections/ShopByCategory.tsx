import Link from "next/link";
import { getCollections } from "@/lib/shopify";

export default async function ShopByCategory() {
  const collections = await getCollections();
  
  // Find individual collections to map nicely into the Bento grid
  const dogFood = collections.find(c => c.handle === "dog-food");
  const catFood = collections.find(c => c.handle === "cat-food");
  const toys = collections.find(c => c.handle === "toys");
  const accessories = collections.find(c => c.handle === "accessories");

  return (
    <section id="categories" className="py-20 max-w-7xl mx-auto px-6 md:px-16 scroll-mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold font-heading text-on-background tracking-tight">
          Shop by Category
        </h2>
        <p className="text-base text-secondary mt-2">
          Everything they need, curated with love.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
        {/* Dog Food Block (col-span-2) */}
        {dogFood && (
          <Link 
            href="/shop?category=dog&type=Organic%20Food"
            className="group relative md:col-span-2 overflow-hidden rounded-2xl bg-surface-container-high aspect-[16/10] md:aspect-auto"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={dogFood.image?.url} 
              alt={dogFood.image?.altText || dogFood.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300"></div>
            <div className="absolute bottom-6 left-6 z-10 transition-all duration-300">
              <span className="inline-block text-[11px] font-bold text-on-primary bg-primary px-3 py-1 rounded-full uppercase tracking-wider">
                Nutritious
              </span>
              <h3 className="text-2xl font-bold font-heading text-white mt-2">
                {dogFood.title}
              </h3>
            </div>
          </Link>
        )}

        {/* Cat Food Block (col-span-1) */}
        {catFood && (
          <Link 
            href="/shop?category=cat&type=Organic%20Food"
            className="group relative col-span-1 overflow-hidden rounded-2xl bg-surface-container-high aspect-square md:aspect-auto"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={catFood.image?.url} 
              alt={catFood.image?.altText || catFood.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-all duration-300"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-2xl font-bold font-heading text-white">
                {catFood.title}
              </h3>
            </div>
          </Link>
        )}

        {/* Toys Block (col-span-1) */}
        {toys && (
          <Link 
            href="/shop?type=Interactive%20Toys"
            className="group relative col-span-1 overflow-hidden rounded-2xl bg-surface-container-high aspect-square md:aspect-auto"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={toys.image?.url} 
              alt={toys.image?.altText || toys.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-all duration-300"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-2xl font-bold font-heading text-white">
                {toys.title}
              </h3>
            </div>
          </Link>
        )}

        {/* Accessories Block (col-span-2) */}
        {accessories && (
          <Link 
            href="/shop?type=Beds%20%26%20Comfort"
            className="group relative md:col-span-2 overflow-hidden rounded-2xl bg-surface-container-high aspect-[16/10] md:aspect-auto"
          >
            <img 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={accessories.image?.url} 
              alt={accessories.image?.altText || accessories.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-all duration-300"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-2xl font-bold font-heading text-white">
                {accessories.title}
              </h3>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
