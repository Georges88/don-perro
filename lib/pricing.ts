import { MoneyV2, Product, ProductVariant } from "@/types/shopify";

export interface CartProductLine {
  product: Product;
  selectedVariantId: string;
  selectedVariantTitle: string;
}

export function getDefaultVariant(product: Product): ProductVariant | undefined {
  return product.variants.find((variant) => variant.availableForSale) || product.variants[0];
}

export function getVariantById(product: Product, variantId?: string): ProductVariant | undefined {
  return product.variants.find((variant) => variant.id === variantId);
}

export function getSelectedVariant(product: Product, variantId?: string): ProductVariant | undefined {
  return getVariantById(product, variantId) || getDefaultVariant(product);
}

export function getSelectedVariantPrice(product: Product, variantId?: string): MoneyV2 {
  return getSelectedVariant(product, variantId)?.price || product.priceRange.minVariantPrice;
}

export function getSelectedVariantCompareAtPrice(product: Product, variantId?: string): MoneyV2 | undefined {
  return getSelectedVariant(product, variantId)?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
}

export function getSelectedVariantAmount(product: Product, variantId?: string): number {
  return Number(getSelectedVariantPrice(product, variantId).amount) || 0;
}

export function hasVariantPriceRange(product: Product): boolean {
  const prices = product.variants.map((variant) => Number(variant.price.amount));
  return prices.length > 1 && Math.min(...prices) !== Math.max(...prices);
}

export function formatMoney(money: MoneyV2, quantity = 1): string {
  const amount = (Number(money.amount) || 0) * quantity;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode || "USD",
  }).format(amount);
}

export function hydrateCartLines<T extends CartProductLine>(items: T[], products: Product[]): T[] {
  return items.map((item) => {
    const currentProduct = products.find(
      (product) => product.id === item.product.id || product.handle === item.product.handle,
    );
    if (!currentProduct) return item;

    const selectedVariant = getVariantById(currentProduct, item.selectedVariantId);
    return {
      ...item,
      product: currentProduct,
      selectedVariantTitle: selectedVariant?.title || item.selectedVariantTitle,
    };
  });
}
