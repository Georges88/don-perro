"use client";

import type { Product } from "@/types/shopify";
import {
  formatMoney,
  getMinimumPriceVariant,
  getSelectedVariantCompareAtPrice,
  getSelectedVariantPrice,
  hasVariantPriceRange,
} from "@/lib/pricing";
import { useAutomaticDiscount } from "@/lib/useAutomaticDiscount";

interface ProductSalePriceProps {
  product: Product;
  variantId?: string;
  quantity?: number;
  className?: string;
  priceClassName?: string;
  originalPriceClassName?: string;
  discountClassName?: string;
}

export default function ProductSalePrice({
  product,
  variantId,
  quantity = 1,
  className = "flex flex-wrap items-baseline gap-2",
  priceClassName = "font-bold text-primary",
  originalPriceClassName = "text-secondary/50 line-through",
  discountClassName = "rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-white",
}: ProductSalePriceProps) {
  const priceVariant = variantId
    ? product.variants.find((variant) => variant.id === variantId)
    : getMinimumPriceVariant(product);
  const resolvedVariantId = priceVariant?.id || variantId;
  const automaticDiscount = useAutomaticDiscount(resolvedVariantId);
  const regularPrice = automaticDiscount?.originalPrice || getSelectedVariantPrice(product, resolvedVariantId);
  const discountedPrice = automaticDiscount?.discountedPrice || regularPrice;
  const selectedCompareAtPrice = getSelectedVariantCompareAtPrice(product, resolvedVariantId);
  const compareAtPrice = automaticDiscount?.originalPrice
    || (selectedCompareAtPrice && Number(selectedCompareAtPrice.amount) > Number(discountedPrice.amount)
      ? selectedCompareAtPrice
      : undefined);
  const prefix = !variantId && hasVariantPriceRange(product) ? "From " : "";

  return (
    <div className={className}>
      <span className={priceClassName}>
        {prefix}{formatMoney(discountedPrice, quantity)}
      </span>
      {compareAtPrice && Number(compareAtPrice.amount) > Number(discountedPrice.amount) && (
        <span className={originalPriceClassName}>
          {formatMoney(compareAtPrice, quantity)}
        </span>
      )}
      {automaticDiscount && (
        <span className={discountClassName} title={automaticDiscount.discountTitle}>
          -{automaticDiscount.discountPercentage}%
        </span>
      )}
    </div>
  );
}
