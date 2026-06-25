import { Product } from "@/types/shopify";

// Safe local storage getter for wishlist
export function getWishlist(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("don_perro_wishlist");
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error("Failed to fetch wishlist", e);
  }
  return [];
}

// Check if a product exists in wishlist
export function isInWishlist(productId: string): boolean {
  const current = getWishlist();
  return current.some((item) => item.id === productId);
}

// Toggle product in or out of wishlist and dispatch event
export function toggleWishlist(product: Product): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getWishlist();
    const exists = current.some((item) => item.id === product.id);
    let updated: Product[];

    if (exists) {
      updated = current.filter((item) => item.id !== product.id);
    } else {
      updated = [...current, product];
    }

    localStorage.setItem("don_perro_wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlist-updated"));
    return !exists; // Returns true if added, false if removed
  } catch (e) {
    console.error("Failed to toggle wishlist item", e);
    return false;
  }
}

// Clear every saved product and notify all wishlist consumers.
export function clearWishlist(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem("don_perro_wishlist", "[]");
    window.dispatchEvent(new Event("wishlist-updated"));
    return true;
  } catch (e) {
    console.error("Failed to clear wishlist", e);
    return false;
  }
}
