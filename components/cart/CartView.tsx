"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Check, 
  X, 
  Lock, 
  ShieldCheck, 
  Truck, 
  PlusCircle, 
  Sparkles 
} from "lucide-react";
import { Product } from "@/types/shopify";
import { getDefaultVariant, getSelectedVariantAmount, hydrateCartLines } from "@/lib/pricing";
import ProductCardActions from "@/components/shop/ProductCardActions";

// Define Cart Item interface
interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantId: string;
  selectedVariantTitle: string;
}

interface CartViewProps {
  initialProducts: Product[];
}

const PENDING_CHECKOUT_KEY = "don_perro_pending_checkout";

function createCartFingerprint(items: CartItem[]) {
  return items
    .map((item) => `${item.selectedVariantId}:${item.quantity}`)
    .sort()
    .join("|");
}

export default function CartView({ initialProducts }: CartViewProps) {
  // Find initial items from our standard catalog to bootstrap the exact cart if none exists in localStorage
  const kibbleProduct = initialProducts.find(p => p.handle === "wilderness-peak-organic-kibble");
  const collarProduct = initialProducts.find(p => p.handle === "everlast-leather-collar");

  // Frequently bought products
  const frequentlyBought = initialProducts.filter(p => 
    ["bamboo-chew-set", "salmon-bites", "explorer-leash", "zen-ceramic-set"].includes(p.handle)
  );

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0); // fraction like 0.1 for 10%
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMessage, setPromoSuccessMessage] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // checkout success state
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "processing" | "success">("cart");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Initialize cart items from localStorage, or load mockup defaults
  useEffect(() => {
    const savedCart = localStorage.getItem("don_perro_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsed) ? hydrateCartLines(parsed, initialProducts) : []);
      } catch (e) {
        console.error("Failed to parse cart items from localStorage", e);
        loadDefaultCart();
      }
    } else {
      loadDefaultCart();
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("don_perro_cart", JSON.stringify(items));
    // Trigger custom event to sync header count
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleClearCart = () => {
    saveCart([]);
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode("");
    setPromoError(null);
    setPromoSuccessMessage(null);
    setShowClearConfirmation(false);
    showToast("Your cart has been cleared.");
  };

  const loadDefaultCart = () => {
    const defaults: CartItem[] = [];
    if (kibbleProduct) {
      defaults.push({
        product: kibbleProduct,
        quantity: 1,
        selectedVariantId: getDefaultVariant(kibbleProduct)?.id || "var_13_1",
        selectedVariantTitle: "12kg Bag • High Protein"
      });
    }
    if (collarProduct) {
      defaults.push({
        product: collarProduct,
        quantity: 1,
        selectedVariantId: getDefaultVariant(collarProduct)?.id || "var_24_1",
        selectedVariantTitle: "Large • Olive Green"
      });
    }
    // If no default products found, initialize empty
    saveCart(defaults);
  };

  // Change quantity
  const handleQuantityChange = (lineIndex: number, delta: number) => {
    const updated = cartItems.map((item, index) => {
      if (index === lineIndex) {
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    saveCart(updated);
  };

  // Remove item
  const handleRemoveItem = (lineIndex: number) => {
    const targetItem = cartItems[lineIndex];
    const updated = cartItems.filter((_, index) => index !== lineIndex);
    saveCart(updated);
    if (targetItem) {
      showToast(`${targetItem.product.title} removed from cart.`);
    }
  };

  // Add recommendation to cart
  const handleAddFromRecommendations = (product: Product) => {
    const existing = cartItems.find(item => item.product.id === product.id);
    if (existing) {
      const updated = cartItems.map(item => {
        if (item.product.id === product.id) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        selectedVariantId: getDefaultVariant(product)?.id || `var_${product.id}_1`,
        selectedVariantTitle: getDefaultVariant(product)?.title || "Standard"
      };
      saveCart([...cartItems, newItem]);
    }
    showToast(`${product.title} added to your cart!`);
  };

  // Toast animation handler
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle applied promo
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccessMessage(null);

    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a coupon code.");
      return;
    }

    if (code === "PETLOVE" || code === "SAVE10") {
      setAppliedPromo(code);
      setPromoDiscount(0.1); // 10% off
      setPromoSuccessMessage(`Promo code "${code}" applied: 10% discount!`);
      showToast(`Promo code "${code}" applied successfully.`);
    } else if (code === "DONPERRO" || code === "BESTBUDDY") {
      setAppliedPromo(code);
      setPromoDiscount(0.15); // 15% off
      setPromoSuccessMessage(`Promo code "${code}" applied: 15% discount!`);
      showToast(`Promo code "${code}" applied successfully.`);
    } else {
      setPromoError("Invalid code. Try 'PETLOVE' or 'DONPERRO'.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode("");
    setPromoSuccessMessage(null);
    showToast("Promo code coordinates deleted.");
  };

  // Checkout sequence navigation
  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutStep("processing");
    setCheckoutError(null);

    try {
      let customerEmail: string | undefined;
      try {
        const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const authPayload = authResponse.ok ? await authResponse.json() : null;
        customerEmail = authPayload?.authenticated ? authPayload.user?.email : undefined;
      } catch {
        customerEmail = undefined;
      }

      const checkoutResponse = await fetch("/api/checkout/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          lines: cartItems.map((item) => ({
            selectedVariantId: item.selectedVariantId,
            quantity: item.quantity,
          })),
        }),
      });
      const checkoutPayload = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutPayload.checkoutUrl) {
        throw new Error(checkoutPayload.error || "Unable to create Shopify checkout.");
      }

      localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({
        startedAt: new Date().toISOString(),
        cartFingerprint: createCartFingerprint(cartItems),
      }));
      window.location.href = checkoutPayload.checkoutUrl;
    } catch (error) {
      console.error(error);
      setCheckoutStep("cart");
      setCheckoutError(error instanceof Error ? error.message : "Unable to create Shopify checkout.");
    }
  };

  // Calculate prices
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = getSelectedVariantAmount(item.product, item.selectedVariantId);
    return sum + (itemPrice * item.quantity);
  }, 0);

  const discountAmount = subtotal * promoDiscount;
  const deliveryFee = subtotal > 150 ? 0 : 5.00;
  const total = subtotal - discountAmount + deliveryFee;

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-32 pb-24 font-sans flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-16 pt-32 pb-24 font-sans text-on-surface relative">
      
      {/* Toast Alert Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface py-3.5 px-5 rounded-xl shadow-2xl flex items-center gap-3 border border-outline-variant/20 max-w-sm"
          >
            <div className="bg-primary/20 p-1.5 rounded-full text-primary">
              <Check className="w-4 h-4 text-[#d9c640]" />
            </div>
            <p className="text-xs font-semibold leading-normal">{toastMessage}</p>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-auto text-inverse-on-surface/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/45 px-5 backdrop-blur-sm"
            onMouseDown={() => setShowClearConfirmation(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="clear-cart-title"
              aria-describedby="clear-cart-description"
              className="relative w-full max-w-md rounded-3xl border border-outline-variant/25 bg-white p-7 shadow-2xl md:p-8"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowClearConfirmation(false)}
                aria-label="Close confirmation"
                className="absolute right-5 top-5 rounded-full p-2 text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-error-container/50 text-error">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2 id="clear-cart-title" className="pr-10 font-heading text-2xl font-bold text-on-surface">
                Clear your cart?
              </h2>
              <p id="clear-cart-description" className="mt-3 text-sm leading-6 text-secondary">
                This will remove all {cartItems.reduce((count, item) => count + item.quantity, 0)} items and any applied promotion. This action cannot be undone.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmation(false)}
                  className="rounded-full border border-outline-variant px-6 py-3 text-xs font-bold text-secondary transition-colors hover:bg-surface-container"
                >
                  Keep Cart
                </button>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-error px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                  <Trash2 className="h-4 w-4" /> Clear Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title Header */}
      <header className="mb-10 flex items-end justify-between gap-5 text-left" id="cart-header">
        <div>
          <h1 className="text-3xl md:text-4.5xl font-extrabold font-heading tracking-tight mb-2">
            Your Cart
          </h1>
          {cartItems.length > 0 && (
            <p className="text-secondary text-sm font-medium">
              You have <span className="text-on-surface font-bold">{cartItems.reduce((c, i) => c + i.quantity, 0)} items</span> in your cart.
            </p>
          )}
        </div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirmation(true)}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-error/25 px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error-container/35"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Cart
          </button>
        )}
      </header>

      {checkoutStep === "processing" && (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest/50 rounded-3xl border border-dashed border-outline-variant/30 text-center min-h-[400px]">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary mb-6"></div>
          <h2 className="text-xl font-bold font-heading mb-2">Processing Your Secure Order...</h2>
          <p className="text-secondary text-sm max-w-sm">Please do not refresh nor close this tab. We are processing transactions securely.</p>
        </div>
      )}

      {checkoutStep === "success" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-6 bg-surface-container-lowest rounded-3xl border border-secondary/15 text-center shadow-xl max-w-2xl mx-auto font-sans"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3.5xl font-extrabold font-heading text-on-surface mb-3">
            Hooray! Order Placed!
          </h2>
          <p className="text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Thank you for shopping at Don Perro Boutiques. Your simulated order has completed successfully and is ready to fulfill! We have sent a package summary to your secure email.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/shop"
              className="px-8 py-3.5 bg-primary hover:opacity-95 text-on-primary rounded-full text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/"
              className="px-8 py-3.5 border border-outline text-secondary hover:bg-surface-container-low rounded-full text-xs font-bold transition-all"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      )}

      {checkoutStep === "cart" && (
        <>
          {cartItems.length === 0 ? (
            /* EMPTY STATE CART VIEW */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30 font-sans" 
              id="empty-state"
            >
              <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6 ring-4 ring-background">
                <ShoppingBag className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-2 font-heading">
                Your cart is empty
              </h2>
              <p className="text-secondary text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                Looks like you haven't added anything to your cart yet. Explore our premium boutique collections to find something exceptional for your pet.
              </p>
              <Link 
                href="/shop"
                className="px-8 py-3.5 bg-primary hover:opacity-95 text-on-primary rounded-full text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            /* CART MAIN DISPLAY CONTAINER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="cart-content">
              
              {/* Left Column: List of items */}
              <div className="lg:col-span-8 flex flex-col">
                
                {/* Headers */}
                <div className="hidden md:grid grid-cols-12 gap-6 pb-4 border-b border-outline-variant/30 text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Items loop */}
                <div className="divide-y divide-outline-variant/20">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item, lineIndex) => {
                      const itemPrice = getSelectedVariantAmount(item.product, item.selectedVariantId);
                      const itemSum = itemPrice * item.quantity;
                      
                      return (
                        <motion.div 
                          key={`${item.product.id}-${item.selectedVariantId}`}
                          layout
                          exit={{ opacity: 0, x: -50, height: 0, padding: 0 }}
                          transition={{ duration: 0.2 }}
                          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center py-6 group relative"
                        >
                          {/* Image & details */}
                          <div className="col-span-12 md:col-span-6 flex gap-4 sm:gap-6">
                            <div className="w-24 h-24 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 border border-secondary/10">
                              <Image 
                                src={item.product.featuredImage.url} 
                                alt={item.product.featuredImage.altText || item.product.title}
                                width={96}
                                height={96}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = "https://picsum.photos/seed/collars/200/200";
                                }}
                              />
                            </div>
                            <div className="flex flex-col justify-center text-left">
                              <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                                {item.product.productType}
                              </span>
                              <Link 
                                href={`/products/${item.product.handle}`}
                                className="text-sm font-bold text-[#191c1c] text-left hover:text-primary transition-colors line-clamp-1 mb-1"
                              >
                                {item.product.title}
                              </Link>
                              <div className="text-xs text-secondary/80 font-medium mb-3 space-y-0.5">
                                <p><span className="font-bold text-secondary">Size:</span> {item.selectedVariantTitle}</p>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveItem(lineIndex)}
                                className="flex items-center gap-1 text-[11px] font-bold text-error hover:underline text-left self-start cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          </div>

                          {/* Quantity selectors */}
                          <div className="col-span-4 md:col-span-2 flex justify-start md:justify-center">
                            <div className="flex items-center border border-outline/30 rounded-full py-1 px-1.5 bg-surface-container-lowest/80">
                              <button 
                                onClick={() => handleQuantityChange(lineIndex, -1)}
                                className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-all cursor-pointer"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-bold text-xs text-on-surface">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => handleQuantityChange(lineIndex, 1)}
                                className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-all cursor-pointer"
                                aria-label="Increase"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Base Price info */}
                          <div className="col-span-4 md:col-span-2 text-left md:text-right text-xs font-semibold text-secondary/70">
                            <span className="md:hidden text-secondary/50 mr-1">Unit price:</span>
                            ${itemPrice.toFixed(2)}
                          </div>

                          {/* Sum Cost Subtotal Column */}
                          <div className="col-span-4 md:col-span-2 text-right text-sm font-bold text-primary">
                            ${itemSum.toFixed(2)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Frequently Bought Together recommendations section */}
                {frequentlyBought.length > 0 && (
                  <section className="mt-14 pt-8 border-t border-outline-variant/30 text-left">
                    <h2 className="text-lg md:text-xl font-bold font-heading text-on-surface mb-6">
                      Frequently Bought Together
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {frequentlyBought.map(prod => {
                        const recPrice = parseFloat(prod.priceRange.minVariantPrice.amount).toFixed(2);
                        return (
                          <div 
                            key={prod.id}
                            className="bg-surface-container-lowest flex flex-col p-3 rounded-2xl border border-secondary/10 hover:shadow-[0px_10px_30px_rgba(90,96,90,0.06)] transform hover:-translate-y-0.5 transition-all group"
                          >
                            <div className="aspect-square rounded-xl bg-surface-container overflow-hidden mb-3 relative">
                              <Image 
                                src={prod.featuredImage.url}
                                alt={prod.featuredImage.altText || prod.title}
                                fill
                                referrerPolicy="no-referrer"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = "https://picsum.photos/seed/rec/200/200";
                                }}
                              />
                              <ProductCardActions product={prod} className="absolute right-2 top-2 z-10" />
                            </div>
                            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest text-left mb-1">
                              {prod.productType}
                            </span>
                            <h4 className="text-xs font-bold text-on-surface text-left line-clamp-1 mb-1">
                              {prod.title}
                            </h4>
                            
                            <div className="flex justify-between items-center mt-auto pt-2">
                              <span className="text-primary font-bold text-xs">${recPrice}</span>
                              <button 
                                onClick={() => handleAddFromRecommendations(prod)}
                                className="text-primary hover:text-on-primary-container transition-colors focus:ring-1 focus:ring-primary rounded-full cursor-pointer"
                                aria-label="Add recommendation to Cart"
                              >
                                <PlusCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Order Summary checkout pane */}
              <aside className="lg:col-span-4 sticky top-32 text-left">
                <div className="bg-surface-container-lowest rounded-3xl shadow-[0_10px_30px_rgba(90,96,90,0.05)] p-6 md:p-8 border border-secondary-container/30">
                  <h2 className="text-lg md:text-xl font-bold font-heading text-on-surface mb-6">
                    Order Summary
                  </h2>

                  {/* Calculations list */}
                  <div className="space-y-4 pb-6 border-b border-outline-variant/30 text-xs sm:text-sm">
                    <div className="flex justify-between items-center text-secondary">
                      <span>Subtotal</span>
                      <span className="text-on-surface font-semibold">${subtotal.toFixed(2)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between items-center text-primary font-medium">
                        <span>Promo Discount ({appliedPromo})</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-secondary">
                      <span>Estimated Delivery</span>
                      {deliveryFee === 0 ? (
                        <span className="text-primary font-semibold">FREE</span>
                      ) : (
                        <span className="text-on-surface font-semibold">${deliveryFee.toFixed(2)}</span>
                      )}
                    </div>

                  </div>

                  {/* Grand total price */}
                  <div className="py-6 flex justify-between items-center text-on-surface">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-xl md:text-2xl font-extrabold text-primary font-heading">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  {/* Prompt check-out actions */}
                  <div className="space-y-3">
                    {checkoutError && (
                      <div className="rounded-2xl border border-error/20 bg-error-container/20 px-4 py-3 text-xs font-semibold text-error">
                        {checkoutError}
                      </div>
                    )}
                    <button 
                      onClick={handleProceedToCheckout}
                      className="w-full bg-primary hover:bg-[#525717] text-on-primary py-3.5 px-4 rounded-full font-bold text-xs shadow-md shadow-primary/10 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <Link 
                      href="/shop"
                      className="w-full block text-center py-3 text-secondary hover:text-primary text-xs font-bold transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Promo Coupons Field */}
                  <div className="mt-8 pt-6 border-t border-outline-variant/30">
                    <label htmlFor="promo-input" className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">
                      Have a Promo Code?
                    </label>
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input 
                        id="promo-input"
                        type="text" 
                        placeholder="PETLOVE"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={appliedPromo !== null}
                        className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                      />
                      {appliedPromo ? (
                        <button 
                          type="button"
                          onClick={handleRemovePromo}
                          className="bg-error/10 hover:bg-error/20 text-error px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Clear
                        </button>
                      ) : (
                        <button 
                          type="submit"
                          className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Apply
                        </button>
                      )}
                    </form>
                    
                    {promoError && (
                      <p className="text-[11px] text-error font-medium mt-2 text-left">{promoError}</p>
                    )}
                    {promoSuccessMessage && (
                      <p className="text-[11px] text-primary font-bold mt-2 text-left">{promoSuccessMessage}</p>
                    )}
                  </div>

                  {/* Trust indicator icons footer */}
                  <div className="mt-6 flex justify-center gap-6 text-secondary/40 border-t border-outline-variant/10 pt-6">
                    <div className="group relative flex flex-col items-center">
                      <Lock className="w-5 h-5 hover:text-primary transition-all cursor-pointer" />
                      <span className="absolute bottom-full mb-1 bg-inverse-surface text-inverse-on-surface text-[9px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Secure checkout</span>
                    </div>
                    <div className="group relative flex flex-col items-center">
                      <ShieldCheck className="w-5 h-5 hover:text-primary transition-all cursor-pointer" />
                      <span className="absolute bottom-full mb-1 bg-inverse-surface text-inverse-on-surface text-[9px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Guaranteed Quality</span>
                    </div>
                    <div className="group relative flex flex-col items-center">
                      <Truck className="w-5 h-5 hover:text-primary transition-all cursor-pointer" />
                      <span className="absolute bottom-full mb-1 bg-inverse-surface text-inverse-on-surface text-[9px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Express Shipping</span>
                    </div>
                  </div>

                </div>
              </aside>

            </div>
          )}
        </>
      )}

    </div>
  );
}
