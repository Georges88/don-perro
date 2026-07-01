import Link from "next/link";
import { getCollections } from "@/lib/shopify";

export default async function ShopByCategory() {
  const collections = await getCollections();
  
  const dogFood = collections.find(c => c.handle === "dog-food");
  const catFood = collections.find(c => c.handle === "cat-food");
  const toys = collections.find(c => c.handle === "toys");
  const accessories = collections.find(c => c.handle === "accessories");
  const categories = [
    dogFood && {
      collection: dogFood,
      href: "/shop?category=dog&type=Organic%20Food",
      badge: "Dogs",
    },
    catFood && {
      collection: catFood,
      href: "/shop?category=cat&type=Organic%20Food",
      badge: "Cats",
    },
    toys && {
      collection: toys,
      href: "/shop?type=Interactive%20Toys",
      badge: "Play",
    },
    accessories && {
      collection: accessories,
      href: "/shop?type=Accessories",
      badge: "Accessories",
    },
  ].filter(Boolean).slice(0, 3);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((item) => (
          <Link
            key={item.collection.id}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl bg-surface-container-high aspect-[4/3] shadow-[0_8px_24px_rgba(90,96,90,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(90,96,90,0.14)]"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={item.collection.image?.url}
              alt={item.collection.image?.altText || item.collection.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300" />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <span className="inline-block text-[11px] font-bold text-on-primary bg-primary px-3 py-1 rounded-full uppercase tracking-wider">
                {item.badge}
              </span>
              <h3 className="text-2xl font-bold font-heading text-white mt-2 leading-tight">
                {item.collection.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
