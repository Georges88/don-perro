export interface ShopifyImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  compareAtPrice?: MoneyV2;
  image?: ShopifyImage | null;
  selectedOptions?: Array<{ name: string; value: string }>;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  vendor: string; // The Brand
  productType: string; // Category, e.g. "Nutrition", "Accessories"
  tags: string[];
  options?: Array<{ name: string; values?: string[] }>;
  featuredImage: ShopifyImage;
  images: ShopifyImage[];
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  compareAtPriceRange?: {
    minVariantPrice: MoneyV2;
  };
  variants: ProductVariant[];
  collections?: Pick<Collection, "id" | "title" | "handle">[];
  rating?: {
    value: number;
    count: number;
  };
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: ShopifyImage;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

export interface MenuItem {
  id?: string;
  label: string;
  href: string;
  items: MenuItem[];
}

export interface Menu {
  title: string;
  handle: string;
  items: MenuItem[];
}

export interface HotelReservationInput {
  ownerName: string;
  phoneNumber: string;
  dogAge: string;
  vaccinationBookUrl?: string;
  message?: string;
}
