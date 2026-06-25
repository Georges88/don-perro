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

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
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

async function shopifyFetch<T>(query: string): Promise<T> {
  const { domain, token, version } = getShopifyConfig();
  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 60 },
  });

  const payload = await response.json() as GraphQLResponse<T>;
  if (!response.ok || payload.errors?.length || !payload.data) {
    const details = payload.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`Shopify Storefront API request failed: ${details}`);
  }

  return payload.data;
}

async function getCatalog(): Promise<CatalogResponse> {
  return shopifyFetch<CatalogResponse>(CATALOG_QUERY);
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
