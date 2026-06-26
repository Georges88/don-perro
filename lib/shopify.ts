import "server-only";

import { mockProducts, mockCollections, mockBrands, mockTestimonials } from "@/data/mockData";
import { Product, Collection, Brand, Testimonial, ShopifyImage, MoneyV2 } from "@/types/shopify";

const CATALOG_QUERY = `#graphql
  query CatalogData {
    products(first: 100) {
      nodes {
        id
        title
        handle
        description
        vendor
        productType
        tags
        featuredImage { url altText width height }
        images(first: 10) { nodes { url altText width height } }
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        variants(first: 100) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
        }
      }
    }
    collections(first: 100) {
      nodes {
        id
        title
        handle
        description
        image { url altText width height }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ShopifyCatalogProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: MoneyV2 };
  compareAtPriceRange: { minVariantPrice: MoneyV2 };
  variants: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
      price: MoneyV2;
      compareAtPrice: MoneyV2 | null;
    }>;
  };
}

interface ShopifyCatalogCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
}

interface CatalogResponse {
  products: { nodes: ShopifyCatalogProduct[] };
  collections: { nodes: ShopifyCatalogCollection[] };
}

interface CartCreateResponse {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: unknown;
}

function getShopifyConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2026-04";

  if (!domain || !token) {
    throw new Error("Shopify Storefront API environment variables are not configured.");
  }

  return { domain, token, version };
}

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>, revalidate = 60): Promise<T> {
  const { domain, token, version } = getShopifyConfig();
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  const payload = await response.json() as GraphQLResponse<T>;
  if (!response.ok || hasShopifyErrors(payload.errors) || !payload.data) {
    const details = formatShopifyErrors(payload.errors) || response.statusText;
    throw new Error(`Shopify Storefront API request failed: ${details}`);
  }

  return payload.data;
}

function formatShopifyErrors(errors: unknown) {
  if (!errors) return "";

  if (Array.isArray(errors)) {
    return errors
      .map((error) => {
        if (typeof error === "string") return error;
        if (error && typeof error === "object" && "message" in error) {
          return String(error.message);
        }
        return JSON.stringify(error);
      })
      .join("; ");
  }

  if (typeof errors === "string") return errors;

  if (typeof errors === "object" && "message" in errors) {
    return String(errors.message);
  }

  return JSON.stringify(errors);
}

function hasShopifyErrors(errors: unknown) {
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  return true;
}

async function getCatalog(): Promise<CatalogResponse> {
  return shopifyFetch<CatalogResponse>(CATALOG_QUERY);
}

export async function createShopifyCart(lines: Array<{ merchandiseId: string; quantity: number }>, email?: string) {
  const data = await shopifyFetch<CartCreateResponse>(
    CART_CREATE_MUTATION,
    {
      input: {
        lines,
        ...(email ? { buyerIdentity: { email } } : {}),
      },
    },
    0,
  );
  const result = data.cartCreate;

  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((error) => error.message).join(" "));
  }

  if (!result.cart?.checkoutUrl) {
    throw new Error("Shopify did not return a checkout URL.");
  }

  return result.cart;
}

function mapProduct(product: ShopifyCatalogProduct): Product {
  const images = product.images.nodes;
  const featuredImage = product.featuredImage || images[0] || {
    url: "/images/product-placeholder.svg",
    altText: product.title,
  };
  const currentPrice = Number(product.priceRange.minVariantPrice.amount);
  const comparePrice = Number(product.compareAtPriceRange.minVariantPrice.amount);

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags.map((tag) => tag.toLowerCase()),
    featuredImage,
    images: images.length ? images : [featuredImage],
    priceRange: product.priceRange,
    compareAtPriceRange: comparePrice > currentPrice ? product.compareAtPriceRange : undefined,
    variants: product.variants.nodes,
  };
}

function mapCollection(collection: ShopifyCatalogCollection): Collection {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description,
    image: collection.image || undefined,
  };
}

async function withMockFallback<T>(load: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`Unable to load Shopify ${label}; using local fallback.`, error);
    return fallback;
  }
}

export async function getProducts(): Promise<Product[]> {
  return withMockFallback(
    async () => (await getCatalog()).products.nodes.map(mapProduct),
    mockProducts,
    "products",
  );
}

export async function getCollections(): Promise<Collection[]> {
  return withMockFallback(
    async () => (await getCatalog()).collections.nodes.map(mapCollection),
    mockCollections,
    "collections",
  );
}

export async function getBrands(): Promise<Brand[]> {
  return mockBrands;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return mockTestimonials;
}

export async function getBestSellers(): Promise<Product[]> {
  const products = await getProducts();
  const tagged = products.filter((product) => product.tags.includes("best-seller"));
  return tagged.length ? tagged : products.slice(0, 4);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  const tagged = products.filter(
    (product) => product.tags.includes("featured") || product.tags.includes("best-seller"),
  );
  return tagged.length ? tagged : products.slice(0, 5);
}

export async function getProductByHandle(handle: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.handle === handle);
}
