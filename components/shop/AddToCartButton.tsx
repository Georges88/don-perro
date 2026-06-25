"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Product } from "@/types/shopify";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantId: string;
  selectedVariantTitle: string;
}

export default function AddToCartButton({ product, className = "" }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstVariant = product.variants?.[0];
  const isAvailable = Boolean(firstVariant?.availableForSale);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleAddToCart = () => {
    if (!firstVariant || !isAvailable) return;

    let cart: CartItem[] = [];
    try {
      const savedCart = localStorage.getItem("don_perro_cart");
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      cart = Array.isArray(parsed) ? parsed : [];
    } catch {
      cart = [];
    }

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedVariantId === firstVariant.id
    );

    if (existingIndex >= 0) {
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity: (cart[existingIndex].quantity || 0) + 1,
      };
    } else {
      cart.push({
        product,
        quantity: 1,
        selectedVariantId: firstVariant.id,
        selectedVariantTitle: firstVariant.title,
      });
    }

    localStorage.setItem("don_perro_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!isAvailable}
      aria-label={added ? `${product.title} added to cart` : `Add ${product.title} to cart`}
      title={isAvailable ? (added ? "Added to cart" : "Add to cart") : "Out of stock"}
      className={`${className} ${added ? "bg-primary text-white" : ""} disabled:cursor-not-allowed disabled:opacity-45`}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
    </button>
  );
}
