import "server-only";

import { mockProducts, mockCollections, mockBrands, mockTestimonials } from "@/data/mockData";
import { Product, Collection, Brand, Testimonial, ShopifyImage, MoneyV2, Menu } from "@/types/shopify";

const CATALOG_QUERY = `#graphql
  query CatalogData {
    products(first: 100) {
      nodes {
        id
        title
        handle
        description
        descriptionHtml
        vendor
        productType
        tags
        options { name }
        featuredImage { url altText width height }
        images(first: 10) { nodes { url altText width height } }
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        collections(first: 20) { nodes { id title handle } }
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

const PRODUCTS_QUERY = `#graphql
  query ProductsPage($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        id
        title
        handle
        description
        descriptionHtml
        vendor
        productType
        tags
        options { name }
        featuredImage { url altText width height }
        images(first: 10) { nodes { url altText width height } }
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        collections(first: 20) { nodes { id title handle } }
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
      pageInfo {
        hasNextPage
        endCursor
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

const MENU_QUERY = `#graphql
  query Menu($handle: String!) {
    menu(handle: $handle) {
      title
      handle
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;

interface ShopifyCatalogProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  options: Array<{ name: string }>;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: MoneyV2 };
  compareAtPriceRange: { minVariantPrice: MoneyV2 };
  collections: { nodes: Array<{ id: string; title: string; handle: string }> };
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

interface ProductsPageResponse {
  products: {
    nodes: ShopifyCatalogProduct[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
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

interface ShopifyMenuItem {
  id: string;
  title: string;
  url: string | null;
  items: ShopifyMenuItem[];
}

interface ShopifyMenu {
  title: string;
  handle: string;
  items: ShopifyMenuItem[];
}

interface MenuResponse {
  menu: ShopifyMenu | null;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: unknown;
}

export interface ShopifyCheckoutAddressPreference {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  country?: string;
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

async function getAllProducts(): Promise<ShopifyCatalogProduct[]> {
  const products: ShopifyCatalogProduct[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await shopifyFetch<ProductsPageResponse>(
      PRODUCTS_QUERY,
      { first: 250, after },
    );

    products.push(...data.products.nodes);
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;

    if (hasNextPage && !after) {
      throw new Error("Shopify product pagination did not return a next cursor.");
    }
  }

  return products;
}

export async function createShopifyCart(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  email?: string,
  address?: ShopifyCheckoutAddressPreference,
) {
  const buyerIdentity: Record<string, unknown> = {};

  if (email) {
    buyerIdentity.email = email;
  }

  if (address?.phone) {
    buyerIdentity.phone = address.phone;
  }

  if (address?.address1 && address.city) {
    buyerIdentity.countryCode = "LB";
    buyerIdentity.deliveryAddressPreferences = [
      {
        deliveryAddress: {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          country: address.country || "Lebanon",
        },
        deliveryAddressValidationStrategy: "COUNTRY_CODE_ONLY",
        oneTimeUse: true,
      },
    ];
  }

  const data = await shopifyFetch<CartCreateResponse>(
    CART_CREATE_MUTATION,
    {
      input: {
        lines,
        ...(Object.keys(buyerIdentity).length ? { buyerIdentity } : {}),
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
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags.map((tag) => tag.toLowerCase()),
    options: product.options,
    featuredImage,
    images: images.length ? images : [featuredImage],
    priceRange: product.priceRange,
    compareAtPriceRange: comparePrice > currentPrice ? product.compareAtPriceRange : undefined,
    variants: product.variants.nodes,
    collections: product.collections.nodes,
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

function normalizeMenuUrl(url: string | null): string {
  if (!url) return "#";

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/collections/")) {
      const collectionHandle = parsed.pathname.split("/collections/")[1]?.split("/")[0];
      if (collectionHandle === "all") return "/shop";
      if (collectionHandle) {
        return `/shop?collection=${encodeURIComponent(collectionHandle)}`;
      }
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    if (url.startsWith("/collections/")) {
      const collectionHandle = url.split("/collections/")[1]?.split("/")[0];
      if (collectionHandle === "all") return "/shop";
      if (collectionHandle) {
        return `/shop?collection=${encodeURIComponent(collectionHandle)}`;
      }
    }

    return url;
  }
}

function mapMenuItem(item: ShopifyMenuItem) {
  return {
    id: item.id,
    label: item.title,
    href: normalizeMenuUrl(item.url),
    items: item.items.map(mapMenuItem),
  };
}

function mapMenu(menu: ShopifyMenu | null): Menu | null {
  if (!menu) return null;

  return {
    title: menu.title,
    handle: menu.handle,
    items: menu.items.map(mapMenuItem),
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
    async () => (await getAllProducts()).map(mapProduct),
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

export async function getMenu(handle = "main-menu"): Promise<Menu | null> {
  return withMockFallback(
    async () => mapMenu((await shopifyFetch<MenuResponse>(MENU_QUERY, { handle })).menu),
    null,
    "menu",
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
