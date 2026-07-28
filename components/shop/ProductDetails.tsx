"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Star, 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Heart
} from "lucide-react";
import { Product } from "@/types/shopify";
import { getWishlist, toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { formatMoney, getDefaultVariant, getSelectedVariant, getSelectedVariantCompareAtPrice, getSelectedVariantPrice, hasVariantPriceRange, hasVisibleVariants } from "@/lib/pricing";
import ProductCardActions from "@/components/shop/ProductCardActions";

interface ProductDetailsProps {
  product: Product;
  allProducts: Product[];
}

export default function ProductDetails({ product, allProducts }: ProductDetailsProps) {
  const productVariants = product.variants || [];
  const showVariantSelector = hasVisibleVariants(product);
  const hasDescription = Boolean(product.description.trim());

  const getVariantOptions = (variant: Product["variants"][number]) => {
    if (variant.selectedOptions?.length) return variant.selectedOptions;

    const values = variant.title.split(" / ");
    return values.map((value, index) => ({
      name: product.options?.[index]?.name || `Option ${index + 1}`,
      value,
    }));
  };

  const defaultVariant = getDefaultVariant(product);
  const defaultSelections = defaultVariant
    ? Object.fromEntries(getVariantOptions(defaultVariant).map(({ name, value }) => [name, value]))
    : {};

  // Image gallery state
  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.featuredImage];
  const [activeImg, setActiveImg] = useState<string>(galleryImages[0].url);

  // Variant selections
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultSelections);
  const [quantity, setQuantity] = useState<number>(1);

  // Cart action feedback state
  const [cartModalItem, setCartModalItem] = useState<{ product: Product; quantity: number; selectedVariantId: string } | null>(null);

  useEffect(() => {
    if (!cartModalItem) return;
    const timer = window.setTimeout(() => setCartModalItem(null), 3500);
    return () => window.clearTimeout(timer);
  }, [cartModalItem]);

  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  const syncWishlist = () => {
    setIsWishlisted(isInWishlist(product.id));
  };

  // Sync wishlist on mount & events
  useEffect(() => {
    syncWishlist();
    const handleStorage = () => syncWishlist();

    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", handleStorage);
    };
  }, [product.id]);

  // Keep active image in sync when changing products
  useEffect(() => {
    if (galleryImages[0]?.url) {
      setActiveImg(galleryImages[0].url);
    }
    setQuantity(1);
    const nextDefaultVariant = getDefaultVariant(product);
    setSelectedOptions(nextDefaultVariant
      ? Object.fromEntries(getVariantOptions(nextDefaultVariant).map(({ name, value }) => [name, value]))
      : {});
    syncWishlist();
  }, [product]);

  // Handle Qty Update
  const updateQty = (val: number) => {
    const newQty = quantity + val;
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  // Add to Cart Simulation
  const handleAddToCart = () => {
    const selectedVariant = resolvedVariant;
    const selectedVariantId = selectedVariant?.id || `var_${product.id}_1`;
    const selectedVariantTitle = selectedVariant?.title || "Default Title";

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
    } catch (err) {
      console.error("Failed to parse cart items:", err);
      currentCart = [];
    }

    const existingIndex = currentCart.findIndex(
      item => item.product.id === product.id &&
        item.selectedVariantId === selectedVariantId
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({
        product,
        quantity,
        selectedVariantId,
        selectedVariantTitle
      });
    }

    try {
      localStorage.setItem("don_perro_cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to save cart items:", err);
    }

    setCartModalItem({ product, quantity, selectedVariantId });
  };

  // Safe Parsing numeric elements
  const selectedVariant = showVariantSelector
    ? productVariants.find((variant) =>
        getVariantOptions(variant).every(({ name, value }) => selectedOptions[name] === value)
      ) || getSelectedVariant(product)
    : getSelectedVariant(product);
  const resolvedVariant = selectedVariant;
  const selectedVariantId = selectedVariant?.id;
  const selectedPrice = getSelectedVariantPrice(product, selectedVariantId);
  const selectedCompareAtPrice = getSelectedVariantCompareAtPrice(product, selectedVariantId);
  const comparePrice = selectedCompareAtPrice && Number(selectedCompareAtPrice.amount) > Number(selectedPrice.amount)
    ? formatMoney(selectedCompareAtPrice, quantity)
    : null;

  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setActiveImg(selectedVariant.image.url);
    }
  }, [selectedVariant?.id, selectedVariant?.image?.url]);

  // Filter Related Products (excl. current product)
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
        
        {/* Navigation Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-secondary/70 mb-8 font-medium tracking-wide">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-secondary/40" />
          <Link href="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-secondary/40" />
          <span className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* Left Column: Image Gallery (7-Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Display Frame */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-surface-variant/40 flex items-center justify-center shadow-xs relative group">
              <img 
                src={activeImg} 
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="eager"
              />
            </div>

            {/* Thumbnails list */}
            {galleryImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-1 scrollbar-thin select-none">
                {galleryImages.map((img, idx) => {
                  const isActive = activeImg === img.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(img.url)}
                      className={`w-20 md:w-24 aspect-square rounded-2xl overflow-hidden bg-white border-2 cursor-pointer transition-all flex-shrink-0 ${
                        isActive 
                          ? "border-primary shadow-sm scale-95" 
                          : "border-transparent opacity-85 hover:opacity-100 hover:border-surface-variant"
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={`${product.title} view ${idx}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Details Form (5-Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Context Labels & Title Block */}
            <div className="space-y-3">
              {/* Product Badge Tag */}
              <div>
                <span className="inline-block bg-secondary-container/60 text-on-secondary-container text-[11px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
                  {product.tags.includes("organic") ? "Organic Certified" : product.productType}
                </span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-2xl md:text-3.5xl font-heading font-extrabold text-[#191c1c] tracking-tight leading-normal">
                {product.title}
              </h1>

              {/* Rating representation */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-[#ffcc00]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current opacity-80" />
                </div>
                <span className="text-xs font-bold text-secondary">
                  ({product.rating?.count || 128} Reviews)
                </span>
              </div>
            </div>

            {/* Price Frame */}
            <div className="pb-4 border-b border-surface-variant/40 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-heading font-extrabold text-primary">
                  {formatMoney(selectedPrice, quantity)}
                </span>
                {comparePrice && (
                  <span className="text-lg text-secondary/50 line-through font-medium">
                    {comparePrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-secondary">
                  {selectedVariant?.availableForSale ? "In Stock & Ready to Ship" : "In Stock"}
                </span>
              </div>
            </div>

            {/* Product option selectors */}
            {showVariantSelector && (
              <div className="space-y-5">
                {(product.options || []).map((option, optionIndex) => {
                  const values = option.values?.length
                    ? option.values
                    : Array.from(new Set(productVariants.map((variant) => getVariantOptions(variant)[optionIndex]?.value).filter(Boolean)));

                  return (
                    <div key={option.name} className="space-y-3">
                      <span className="text-xs font-bold text-[#191c1c] uppercase tracking-wider block">
                        {option.name}
                      </span>
                      <div className="flex flex-wrap gap-2.5 select-none">
                        {values.map((value) => {
                          const isActive = selectedOptions[option.name] === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setSelectedOptions((current) => ({ ...current, [option.name]: value }))}
                              className={`px-5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                                  : "border-outline-variant/40 hover:border-secondary/60 text-secondary"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Interactive Qty Selection Action */}
            <div className="flex flex-wrap items-end gap-4 pt-4 sm:flex-nowrap">
              <div className="w-fit flex-none space-y-2 select-none">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Qty</span>
                <div className="flex w-fit items-center border-2 border-outline-variant/30 rounded-xl bg-surface-container-low h-13 overflow-hidden">
                  <button 
                    onClick={() => updateQty(-1)}
                    className="p-3 text-secondary hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="min-w-9 px-3 text-center font-sans text-sm font-extrabold text-on-surface">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => updateQty(1)}
                    className="p-3 text-secondary hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary Call to Action Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="order-3 h-13 w-full flex-grow bg-primary hover:bg-primary-tint/95 text-on-primary rounded-full font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all cursor-pointer sm:order-none sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              {/* Wishlist toggle button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`order-2 w-13 h-13 flex-none rounded-full border-2 cursor-pointer flex items-center justify-center transition-all sm:order-none ${
                  isWishlisted
                    ? "border-primary bg-primary/5 text-primary scale-102"
                    : "border-outline-variant/30 hover:border-primary text-secondary/80 hover:text-primary bg-surface-container-low"
                }`}
                aria-label="Toggle wishlist"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>

            {/* Custom quality banners in grid margin */}
            <div className="border-t border-surface-variant/40 pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5 text-xs text-secondary/90 font-semibold font-sans">
                <Truck className="w-4 h-4 text-primary" />
                Free 2-day Shipping
              </div>
              <div className="flex items-center gap-2.5 text-xs text-secondary/90 font-semibold font-sans">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Don Perro Quality Guarantee
              </div>
            </div>

          </div>
        </div>

        {hasDescription && (
          <div className="mb-10 animate-fade-in text-on-surface font-sans">
            <div className="w-full space-y-3">
              <h3 className="text-lg font-heading font-extrabold text-[#191c1c]">
                Product Description
              </h3>
              {product.descriptionHtml ? (
                <div
                  className="font-sans text-black text-sm md:text-base leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_b]:font-bold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : (
                <p className="font-sans whitespace-pre-line text-black text-sm md:text-base leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS SECTION ("You May Also Like") */}
        <section className="border-t border-surface-variant/30 pt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold font-heading text-[#191c1c] tracking-tight">
                You May Also Like
              </h2>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                More handcrafted elements tailored with absolute care.
              </p>
            </div>
            <Link 
              href="/shop" 
              className="text-xs sm:text-sm font-bold text-primary border-b-2 border-primary pb-0.5 hover:text-[#504700] hover:border-[#504700] transition-colors"
            >
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const itemPrice = parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2);
              const pricePrefix = hasVariantPriceRange(p) ? "From " : "";
              const isNew = p.tags.includes("new");
              const isSale = p.tags.includes("sale");

              return (
                <div
                  key={p.id}
                  className="group flex flex-col cursor-pointer transition-all duration-300 select-none"
                >
                  <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-surface-variant/30 relative shadow-xs group-hover:shadow-[0_8px_24px_rgba(90,96,90,0.06)] group-hover:-translate-y-0.5 transition-all duration-300 mb-3">
                    <Link href={`/products/${p.handle}`} className="block h-full w-full">
                      <img 
                        src={p.featuredImage.url} 
                        alt={p.featuredImage.altText || p.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </Link>
                    <ProductCardActions product={p} className="absolute right-3 top-3 z-10" />
                    
                    {/* Badge */}
                    {isNew && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                    {isSale && (
                      <span className="absolute top-3 left-3 bg-error text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                        Sale
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 block">
                    {p.productType}
                  </span>
                  
                  <Link href={`/products/${p.handle}`}>
                    <h3 className="text-xs sm:text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-1 leading-snug">
                      {p.title}
                    </h3>
                  </Link>

                  <span className="text-primary font-bold text-xs sm:text-sm">
                    {pricePrefix}${itemPrice}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* ----------------------------------------------------
          Interactive Toast Alert: Added to Cart Toast Alert
          ---------------------------------------------------- */}
      {cartModalItem && (
        <div className="fixed bottom-24 right-6 z-50 bg-background max-w-sm w-[calc(100%-3rem)] p-4 rounded-2xl shadow-2xl border border-surface-variant/40 animate-slide-in flex gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#edeeee]">
            <img 
              src={cartModalItem.product.featuredImage.url} 
              alt={cartModalItem.product.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow space-y-1 select-none">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-primary font-sans uppercase">Added to cart!</span>
              <button onClick={() => setCartModalItem(null)}>
                <X className="w-3.5 h-3.5 text-secondary/60 hover:text-primary" />
              </button>
            </div>
            <h4 className="text-xs font-bold text-on-surface line-clamp-1">{cartModalItem.product.title}</h4>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-secondary font-mono">Qty: {cartModalItem.quantity}</span>
              <span className="text-xs font-bold text-primary">
                {formatMoney(getSelectedVariantPrice(cartModalItem.product, cartModalItem.selectedVariantId), cartModalItem.quantity)}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
