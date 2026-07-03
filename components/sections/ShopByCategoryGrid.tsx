"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ShopifyImage } from "@/types/shopify";

interface CategoryCard {
  id: string;
  title: string;
  handle: string;
  image?: ShopifyImage;
}

interface ShopByCategoryGridProps {
  categories: CategoryCard[];
}

export default function ShopByCategoryGrid({ categories }: ShopByCategoryGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleCategories = isExpanded ? categories : categories.slice(0, 3);
  const hasMore = categories.length > 3;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCategories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?collection=${encodeURIComponent(category.handle)}`}
            className="group relative overflow-hidden rounded-2xl bg-surface-container-high aspect-[4/3] shadow-[0_8px_24px_rgba(90,96,90,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(90,96,90,0.14)]"
          >
            {category.image?.url ? (
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={category.image.url}
                alt={category.image.altText || category.title}
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f7f6ef_0,#e8e9e3_68%,#dfe2dc_100%)]" />
            )}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300" />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h3 className="text-2xl font-bold font-heading text-white leading-tight">
                {category.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            {isExpanded ? "Show Less" : "View More Categories"}
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
}
