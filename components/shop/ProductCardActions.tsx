"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { Product } from "@/types/shopify";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";

interface ProductCardActionsProps {
  product: Product;
  className?: string;
}

export default function ProductCardActions({ product, className = "" }: ProductCardActionsProps) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const syncWishlist = () => setWishlisted(isInWishlist(product.id));
    syncWishlist();
    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, [product.id]);

  const handleWishlist = () => {
    setWishlisted(toggleWishlist(product));
  };

  const actionClass = "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-secondary shadow-sm transition-all duration-300 hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className={`flex flex-row gap-2 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto ${className}`}>
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={wishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
        aria-pressed={wishlisted}
        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`${actionClass} ${wishlisted ? "bg-white text-primary scale-105" : ""}`}
      >
        <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-current" : ""}`} />
      </button>
      <Link
        href={`/products/${product.handle}`}
        aria-label={`View ${product.title}`}
        title="View product"
        className={actionClass}
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
