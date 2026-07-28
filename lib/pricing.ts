import { MoneyV2, Product, ProductVariant } from "@/types/shopify";

export interface CartProductLine {
  product: Product;
  selectedVariantId: string;
  selectedVariantTitle: string;
}

function getVariantOptions(product: Product, variant: ProductVariant) {
  if (variant.selectedOptions?.length) return variant.selectedOptions;

  return variant.title.split(" / ").map((value, index) => ({
    name: product.options?.[index]?.name || `Option ${index + 1}`,
    value,
  }));
}

function getAdditiveOptionPriceLevels(product: Product): number[] | undefined {
  const options = product.options || [];
  if (options.length < 2 || !product.variants.length) return undefined;

  const valueCount = options[0]?.values?.length || 0;
  if (
    valueCount < 2 ||
    options.some((option) => option.values?.length !== valueCount)
  ) {
    return undefined;
  }

  const lastOption = options[options.length - 1];
  const pricesByLastValue = new Map<string, number>();

  for (const variant of product.variants) {
    const selectedValue = getVariantOptions(product, variant)
      .find(({ name }) => name === lastOption.name)?.value;
    const amount = Number(variant.price.amount);
    if (!selectedValue || !Number.isFinite(amount)) return undefined;

    const currentAmount = pricesByLastValue.get(selectedValue);
    if (currentAmount !== undefined && currentAmount !== amount) return undefined;
    pricesByLastValue.set(selectedValue, amount);
  }

  const levels = lastOption.values?.map((value) => pricesByLastValue.get(value));
  if (
    !levels ||
    levels.some((amount) => amount === undefined) ||
    new Set(levels).size !== valueCount
  ) {
    return undefined;
  }

  return levels as number[];
}

function getAdditiveVariantPrice(product: Product, variant?: ProductVariant): MoneyV2 | undefined {
  const levels = getAdditiveOptionPriceLevels(product);
  if (!levels || !variant) return undefined;

  const selections = getVariantOptions(product, variant);
  const amount = (product.options || []).reduce((total, option) => {
    const selectedValue = selections.find(({ name }) => name === option.name)?.value;
    const valueIndex = option.values?.indexOf(selectedValue || "") ?? -1;
    return valueIndex >= 0 ? total + levels[valueIndex] : total;
  }, 0);

  return {
    amount: amount.toString(),
    currencyCode: variant.price.currencyCode,
  };
}

function getVariantPrice(product: Product, variant: ProductVariant): MoneyV2 {
  return getAdditiveVariantPrice(product, variant) || variant.price;
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
  const variant = getSelectedVariant(product, variantId);
  return (variant ? getVariantPrice(product, variant) : undefined)
    || product.priceRange.minVariantPrice;
}

export function getSelectedVariantCompareAtPrice(product: Product, variantId?: string): MoneyV2 | undefined {
  return getSelectedVariant(product, variantId)?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
}

export function getSelectedVariantAmount(product: Product, variantId?: string): number {
  return Number(getSelectedVariantPrice(product, variantId).amount) || 0;
}

export function getMinimumVariantPrice(product: Product): MoneyV2 {
  if (!product.variants.length) return product.priceRange.minVariantPrice;

  return product.variants
    .map((variant) => getVariantPrice(product, variant))
    .reduce((lowest, price) =>
      Number(price.amount) < Number(lowest.amount) ? price : lowest
    );
}

export function hasVariantPriceRange(product: Product): boolean {
  const prices = product.variants.map((variant) =>
    Number(getVariantPrice(product, variant).amount)
  );
  return prices.length > 1 && Math.min(...prices) !== Math.max(...prices);
}

export function isDefaultVariantTitle(title?: string): boolean {
  const normalizedTitle = title?.trim().toLowerCase();
  return normalizedTitle === "default" || normalizedTitle === "default title";
}

export function hasVisibleVariants(product: Product): boolean {
  const variants = product.variants || [];
  return variants.length > 1 || variants.some((variant) => !isDefaultVariantTitle(variant.title));
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
