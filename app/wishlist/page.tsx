"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, 
  ShoppingCart, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Trash2,
  X
} from "lucide-react";
import { Product } from "@/types/shopify";
import { clearWishlist, getWishlist, setWishlist } from "@/lib/wishlist";
import { getDefaultVariant, hasVariantPriceRange } from "@/lib/pricing";
import ProductCardActions from "@/components/shop/ProductCardActions";
import ProductSalePrice from "@/components/shop/ProductSalePrice";
import { mockProducts } from "@/data/mockData";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Load wishlist items and recommendation fallbacks
  const syncWishlist = () => {
    const items = getWishlist();
    setWishlistItems(items);
  };

  useEffect(() => {
    syncWishlist();
    // Get 4 featured or popular recommendation products as fallback
    const popular = mockProducts.slice(0, 4);
    setRecommendations(popular);

    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);

    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, []);

  const showNotice = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 3500);
  };

  const handleClearWishlist = () => {
    if (clearWishlist()) {
      setShowClearConfirmation(false);
      showNotice("Your wishlist has been cleared.");
    }
  };

  const handleRemoveFromWishlist = (product: Product) => {
    const updated = wishlistItems.filter((item) => item.id !== product.id);
    if (setWishlist(updated)) {
      setWishlistItems(updated);
      showNotice(`Removed "${product.title}" from your wishlist.`);
    }
  };

  // Add a wishlisted item to the custom cart
  const handleAddToCart = (product: Product) => {
    interface CartItem {
      product: Product;
      quantity: number;
      selectedVariantId: string;
      selectedVariantTitle: string;
    }

    let currentCart: CartItem[] = [];
    try {
      const savedCart = localStorage.getItem("don_perro_cart");
      if (savedCart) {
        currentCart = JSON.parse(savedCart);
        if (!Array.isArray(currentCart)) {
          currentCart = [];
        }
      }
    } catch (e) {
      currentCart = [];
    }

    const firstVariant = getDefaultVariant(product);
    const selectedVariantId = firstVariant?.id || `var_${product.id}_1`;
    const selectedVariantTitle = firstVariant?.title || "Standard";

    const existingIndex = currentCart.findIndex(
      item => item.product.id === product.id && item.selectedVariantId === selectedVariantId
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        product,
        quantity: 1,
        selectedVariantId,
        selectedVariantTitle
      });
    }

    try {
      localStorage.setItem("don_perro_cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));
      showNotice(`Successfully added "${product.title}" to your cart!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        
        {/* Breadcrumb Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-secondary uppercase tracking-widest mb-4 select-none">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-secondary/40" />
          <Link href="/shop" className="hover:text-primary transition-colors">Boutique</Link>
          <ChevronRight className="w-3 h-3 text-secondary/40" />
          <span className="text-secondary/60">Favorites</span>
        </div>

        {/* Dynamic Action Notifications Banner */}
        {activeNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1e2924] text-[#e1e3df] text-xs font-bold px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-[#2b3530] animate-slide-in select-none">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <p>{activeNotification}</p>
          </div>
        )}

        {showClearConfirmation && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/45 px-5 backdrop-blur-sm"
            onMouseDown={() => setShowClearConfirmation(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="clear-wishlist-title"
              aria-describedby="clear-wishlist-description"
              className="relative w-full max-w-md rounded-3xl border border-outline-variant/25 bg-white p-7 shadow-2xl animate-fade-in md:p-8"
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
              <h2 id="clear-wishlist-title" className="pr-10 font-heading text-2xl font-bold text-on-surface">
                Clear your wishlist?
              </h2>
              <p id="clear-wishlist-description" className="mt-3 text-sm leading-6 text-secondary">
                This will remove all {wishlistItems.length} saved essentials. This action cannot be undone.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmation(false)}
                  className="rounded-full border border-outline-variant px-6 py-3 text-xs font-bold text-secondary transition-colors hover:bg-surface-container"
                >
                  Keep Wishlist
                </button>
                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-error px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                  <Trash2 className="h-4 w-4" /> Clear Everything
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-secondary-container/20 pb-8 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-[#191c1c] mb-2">
              My Favorites
            </h1>
            <p className="text-sm text-secondary/85 max-w-lg">
              Elevate companion longevity. Curate and organize premium lifestyle essentials crafted specifically for your pet&apos;s happiness.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 self-start md:mt-0">
            <span className="text-xs font-bold text-primary font-mono bg-primary/5 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 select-none">
              <Sparkles className="w-3.5 h-3.5" />
              {wishlistItems.length} Saved Essentials
            </span>
            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirmation(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-error/25 px-3 py-1.5 text-xs font-bold text-error transition-colors hover:bg-error-container/35"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Wishlist
              </button>
            )}
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          /* Wishlisted Items Directory Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              return (
                <div 
                  key={product.id} 
                  className="group flex flex-col relative bg-surface-container-lowest p-3 border border-secondary/15 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-secondary/5 hover:-translate-y-0.5"
                >
                  {/* Image Frame overlay */}
                  <div className="relative aspect-square overflow-hidden bg-surface-container rounded-xl mb-4">
                    <Link href={`/products/${product.handle}`} className="block w-full h-full cursor-pointer">
                      <img 
                        src={product.featuredImage.url} 
                        alt={product.featuredImage.altText || product.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-103"
                        onError={(e) => {
                          e.currentTarget.src = "https://picsum.photos/seed/kibble/400/400";
                        }}
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromWishlist(product)}
                      aria-label={`Remove ${product.title} from wishlist`}
                      title="Remove from wishlist"
                      className="absolute left-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-error opacity-0 shadow-sm transition-all hover:bg-white hover:scale-105 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/35 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <ProductCardActions product={product} className="absolute right-2.5 top-2.5 z-10" />
                  </div>

                  {/* Metadata display */}
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">
                    {product.productType}
                  </p>
                  
                  <Link 
                    href={`/products/${product.handle}`}
                    className="cursor-pointer block text-xs sm:text-sm font-bold text-[#191c1c] hover:text-primary transition-colors line-clamp-2 leading-relaxed mb-1 font-sans"
                  >
                    {product.title}
                  </Link>

                  <ProductSalePrice
                    product={product}
                    className="mb-4 flex flex-wrap items-baseline gap-2"
                    priceClassName="text-sm font-extrabold text-primary sm:text-base"
                    originalPriceClassName="text-[11px] text-secondary/40 line-through font-mono"
                  />

                  {/* Immediate Add to Cart trigger */}
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-auto bg-primary hover:bg-[#153434] text-white text-[11px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Favorites States with Fallback Actions */
          <div className="border border-dashed border-outline-variant/30 rounded-3xl p-12 md:p-16 text-center max-w-2xl mx-auto select-none">
            <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-heading font-black text-[#191c1c] mb-2">Your Wishlist is empty.</h2>
            <p className="text-xs sm:text-sm text-secondary/80 max-w-md mx-auto mb-8 leading-relaxed">
              Explore our boutique catalog and save items that your furry friends will absolutely enjoy. Add items to your wishlist anytime!
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-[#153434] text-white text-xs font-bold px-6 py-3.5 rounded-full transition-colors font-sans shadow-lg shadow-primary/10"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Boutique Shop
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Smart Fallback Suggestions Panel */}
            <div className="border-t border-secondary-container/10 mt-16 pt-12 text-left">
              <h3 className="text-sm font-extrabold text-[#191c1c] uppercase tracking-wider mb-6 flex items-center gap-2 select-none">
                <Sparkles className="w-4 h-4 text-primary" />
                Featured Trends
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((rec) => {
                  const recPrice = parseFloat(rec.priceRange.minVariantPrice.amount).toFixed(2);
                  const recPricePrefix = hasVariantPriceRange(rec) ? "From " : "";
                  return (
                    <div key={rec.id} className="group relative flex flex-col bg-surface-container-lowest border border-secondary/10 p-2.5 rounded-xl">
                      <Link href={`/products/${rec.handle}`} className="block relative aspect-square overflow-hidden bg-surface-container rounded-lg mb-2">
                        <img 
                          src={rec.featuredImage.url} 
                          alt={rec.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </Link>
                      <Link href={`/products/${rec.handle}`} className="text-[11px] font-bold line-clamp-1 text-secondary hover:text-primary transition-colors">
                        {rec.title}
                      </Link>
                      <span className="text-primary font-bold text-xs mt-1">
                        {recPricePrefix}${recPrice}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
