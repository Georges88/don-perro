import { getCollections } from "@/lib/shopify";
import ShopByCategoryGrid from "@/components/sections/ShopByCategoryGrid";
import type { Collection } from "@/types/shopify";

const CATEGORY_NAMES = [
  "Beds",
  "Bird Food",
  "Bowls And Feeders",
  "Brushes",
  "Collars",
  "Crates & Bags",
  "Fish Food",
  "Harnesses",
  "Health & Wellness",
  "Ice Cream",
  "Leashes",
  "Perfumes",
  "Pet Milk",
  "Rabbit Food",
  "Toys",
];

const CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  Beds: "/images/categories/beds.png",
  "Bird Food": "/images/categories/bird-food.png",
  "Bowls And Feeders": "/images/categories/bowls-and-feeders.png",
};

function normalize(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findCollection(collections: Collection[], name: string) {
  const normalizedName = normalize(name);
  const handleCandidates = new Set([
    slugify(name),
    slugify(name.replace(/&/g, "")),
    slugify(name.replace(/&/g, "and")),
  ]);

  return collections.find((collection) => (
    normalize(collection.title) === normalizedName
    || handleCandidates.has(collection.handle)
  ));
}

export default async function ShopByCategory() {
  const collections = await getCollections();
  const categories = CATEGORY_NAMES.map((name) => {
    const collection = findCollection(collections, name);
    const handle = collection?.handle || slugify(name);

    return {
      id: collection?.id || handle,
      title: collection?.title || name,
      handle,
      image: CATEGORY_IMAGE_OVERRIDES[name]
        ? { url: CATEGORY_IMAGE_OVERRIDES[name], altText: name }
        : collection?.image,
    };
  });

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

      <ShopByCategoryGrid categories={categories} />
    </section>
  );
}
