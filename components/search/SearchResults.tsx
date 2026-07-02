"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ShoppingCart, 
  SlidersHorizontal,
  Plus,
  Minus,
  Check,
  Sparkles,
  SearchCode,
  Heart,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "@/types/shopify";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import { getDefaultVariant, hasVariantPriceRange } from "@/lib/pricing";
import { searchProducts } from "@/lib/elasticSearch";

interface SearchResultsProps {
  products: Product[];
}

export default function SearchResults({ products }: SearchResultsProps) {
  const searchParams = useSearchParams();

  // URL search query
  const queryParam = searchParams.get("q") || "";

  // ----------------------------------------------------
  // Interactive Local Filter States
  // ----------------------------------------------------
  const [activeQuery, setActiveQuery] = useState(queryParam);
  
  // Price Range
  const [priceLimit, setPriceLimit] = useState<number>(150);

  // Availability
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Sort State
  const [sortBy, setSortBy] = useState<string>("Best Selling");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const sortOptions = [
    "Best Selling",
    "Price: Low to High",
    "Price: High to Low",
    "Newest Arrivals"
  ];

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals & Toast State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Sync wishlist status function
  const syncWishlist = () => {
    setWishlistIds(getWishlist().map(item => item.id));
  };

  // Sync with URL query and wishlist on mount / change
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setActiveQuery(q);
    setCurrentPage(1);
    syncWishlist();

    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, [searchParams]);

  // Clear all filters
  const clearAllFilters = () => {
    setPriceLimit(150);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const rankedProducts = activeQuery.trim()
    ? searchProducts(products, activeQuery).map((result) => result.product)
    : products;

  const filteredProducts = rankedProducts.filter(product => {

    // 3. Price Filter
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    if (price > priceLimit) return false;

    // 4. Availability Filter
    if (inStockOnly) {
      const hasAvailableVariant = product.variants.some((variant) => variant.availableForSale);
      if (!hasAvailableVariant) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (activeQuery.trim() && sortBy === "Best Selling") {
      return 0;
    }

    const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
    const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

    if (sortBy === "Price: Low to High") {
      return priceA - priceB;
    }
    if (sortBy === "Price: High to Low") {
      return priceB - priceA;
    }
    if (sortBy === "Newest Arrivals") {
      const aIsNew = a.tags.includes("new") ? 1 : 0;
      const bIsNew = b.tags.includes("new") ? 1 : 0;
      return bIsNew - aIsNew;
    }
    // "Best Selling" default
    const aIsBest = a.tags.includes("best-seller") ? 1 : 0;
    const bIsBest = b.tags.includes("best-seller") ? 1 : 0;
    return bIsBest - aIsBest;
  });

  // Pagination bounds
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const firstVisiblePage = Math.max(1, Math.min(activePage - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  const getBadge = (product: Product) => {
    if (product.tags.includes("new")) return { text: "New", class: "bg-primary text-white" };
    if (product.tags.includes("organic")) return { text: "Organic", class: "bg-tertiary text-white" };
    if (product.tags.includes("sale") || product.compareAtPriceRange) return { text: "Sale", class: "bg-error text-white" };
    return null;
  };

  const handleAddToCart = (product: Product) => {
    const selectedVariant = getDefaultVariant(product);
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
    } catch (err) {
      console.error("Failed to save cart items:", err);
    }

    setCartNotification(`${product.title} has been added to your cart.`);
    setTimeout(() => setCartNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-16 pt-24 pb-24 font-sans text-on-surface">
      
      {/* Toast Alert / Cart Notification */}
      {cartNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface py-3.5 px-5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up border border-outline-variant/20 max-w-sm">
          <div className="bg-primary/20 p-1.5 rounded-full text-primary">
            <Check className="w-4 h-4 text-[#d9c640]" />
          </div>
          <p className="text-xs font-semibold leading-normal">{cartNotification}</p>
          <button 
            onClick={() => setCartNotification(null)}
            className="ml-auto text-inverse-on-surface/60 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-secondary/70 mb-8 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-secondary font-semibold">Search</span>
      </div>

      {/* Header section with query summary & controls */}
      <header className="mb-10 border-b border-outline/20 pb-8" id="search-results-header">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-heading text-[#0b1515] mb-5">
              Search
            </h1>
            <p className="text-secondary max-w-xl leading-relaxed">
              {activeQuery
                ? `Showing premium essentials matching "${activeQuery}".`
                : "Find premium essentials for your companions, hand-crafted with organic precision."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 border border-outline/10 rounded-full hover:border-outline/40 transition-all text-xs font-bold text-primary cursor-pointer active:scale-98 select-none"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-semibold text-secondary whitespace-nowrap">Sort:</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  {sortBy}
                  <ChevronDown className={`w-3.5 h-3.5 text-primary transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20 cursor-default" 
                      onClick={() => setIsSortOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-outline/10 rounded-xl shadow-[0px_10px_30px_rgba(90,96,90,0.08)] py-1.5 z-30 overflow-hidden"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSortBy(option);
                            setIsSortOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                            sortBy === option 
                              ? "bg-primary-container/20 text-primary font-bold" 
                              : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                          }`}
                        >
                          <span>{option}</span>
                          {sortBy === option && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active Filter Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs mt-6">
          {inStockOnly && (
            <span className="text-secondary font-semibold mr-1">Active filters:</span>
          )}
          {inStockOnly && (
            <button
              onClick={() => {
                setInStockOnly(false);
                setCurrentPage(1);
              }}
              className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors px-3 py-1 rounded-full font-medium flex items-center gap-1 cursor-pointer select-none"
            >
              In Stock
              <X className="w-3 h-3 text-[#5a605a] ml-0.5" />
            </button>
          )}
          {(inStockOnly || priceLimit < 150) && (
            <button 
              onClick={clearAllFilters}
              className="text-primary font-bold hover:underline transition-all ml-1 text-xs cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filter Panel */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 select-none">
          
          {/* Price Range Slider */}
          <div id="filter-price-section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">
              Price Range
            </h3>
            <div className="space-y-3">
              <input 
                type="range"
                min="10"
                max="150"
                value={priceLimit}
                onChange={(e) => {
                  setPriceLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs font-mono font-semibold text-secondary">
                <span>$10</span>
                <span className="text-primary bg-primary-container/20 px-2 py-0.5 rounded-full font-bold">Up to ${priceLimit}</span>
                <span>$150</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/20" />

          {/* Availability */}
          <div id="filter-availability-section">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">
              Availability
            </h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox"
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className="rounded border-outline/30 text-primary focus:ring-primary h-4.5 w-4.5"
              />
              <span className="text-sm text-secondary group-hover:text-primary transition-colors font-sans font-medium">
                In Stock Only
              </span>
            </label>
          </div>

        </aside>

        {/* Results Main Section */}
        <section className="flex-grow">
          
          {/* Grid of Product Cards */}
          {totalItems > 0 ? (
            <div>
              <div className="flex justify-between items-center text-xs text-secondary/70 mb-4 font-sans font-medium px-1">
                <span>
                  Showing <span className="text-primary font-bold font-mono">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span>-
                  <span className="text-primary font-bold font-mono">{Math.min(indexOfLastItem, totalItems)}</span> of{" "}
                  <span className="text-primary font-bold font-mono">{totalItems}</span> premium goods
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6" id="search-results-grid">
                {currentItems.map(product => {
                  const badge = getBadge(product);
                  const price = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2);
                  const pricePrefix = hasVariantPriceRange(product) ? "From " : "";
                  const hasCompare = product.compareAtPriceRange && parseFloat(product.compareAtPriceRange.minVariantPrice.amount) > 0;
                  const comparePrice = hasCompare ? parseFloat(product.compareAtPriceRange!.minVariantPrice.amount).toFixed(2) : null;

                  return (
                    <div 
                      key={product.id}
                      className="group flex flex-col relative transition-all duration-300 select-none"
                    >
                    {/* Image Frame with Link to details */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#edeeee] mb-4 shadow-[0_4px_10px_rgba(90,96,90,0.02)] group-hover:shadow-[0_10px_30px_rgba(90,96,90,0.08)] group-hover:-translate-y-1 transition-all duration-300">
                      <Link href={`/products/${product.handle}`} className="block w-full h-full cursor-pointer">
                        <img 
                          src={product.featuredImage.url} 
                          alt={product.featuredImage.altText || product.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/seed/kibbles/400/400";
                          }}
                        />
                      </Link>

                      {/* Display Badge (New, Sale, Organic) */}
                      {badge && (
                        <div className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none ${badge.class}`}>
                          {badge.text}
                        </div>
                      )}

                      {/* Float Quick View button */}
                      <button 
                        onClick={() => setQuickViewProduct(product)}
                        className="absolute top-2.5 right-2.5 bg-white/95 text-secondary hover:text-primary hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                        aria-label="Quick Peek"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Wishlist Heart Icon */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleWishlist(product);
                        }}
                        className={`absolute top-2.5 right-11 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md cursor-pointer z-10 ${
                          wishlistIds.includes(product.id)
                            ? "bg-white text-primary scale-105"
                            : "bg-white/90 hover:bg-white text-secondary hover:text-primary"
                        }`}
                        aria-label="Toggle favorite wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(product.id) ? "fill-primary text-primary" : ""}`} />
                      </button>

                      {/* Direct Add to Cart Float Button */}
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="absolute bottom-2.5 right-2.5 bg-white text-secondary hover:bg-primary hover:text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
                        aria-label="Add to cart instantly"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata Detail Labels */}
                    <Link href={`/products/${product.handle}`} className="flex flex-col flex-grow cursor-pointer px-1">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">
                        {product.productType}
                      </p>
                      
                      <h3 className="text-xs sm:text-sm font-bold text-[#191c1c] group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
                        {product.title}
                      </h3>

                      <div className="mt-auto pt-1 flex items-baseline gap-2">
                        <span className="text-primary font-extrabold text-sm sm:text-base font-heading">
                          {pricePrefix}${price}
                        </span>
                        {comparePrice && (
                          <span className="text-[11px] text-secondary/40 line-through font-mono">
                            ${comparePrice}
                          </span>
                        )}
                      </div>
                    </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            
            /* No Results Screen state perfectly aligned with Figma design! */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30 font-sans" id="search-no-results">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-5 ring-4 ring-surface">
                <SearchCode className="w-9 h-9 text-secondary/60 animate-pulse" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-2 font-heading">
                No results for "{activeQuery}"
              </h2>
              <p className="text-secondary text-sm max-w-sm mx-auto mb-6">
                We couldn't find exactly what you were looking for. Try adjusting your filters or checking your spelling!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-primary hover:opacity-95 text-on-primary rounded-full text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
                <Link 
                  href="/shop"
                  className="px-6 py-2.5 border border-outline text-secondary hover:bg-surface-container-low rounded-full text-xs font-bold transition-all"
                >
                  Browse Full Catalog
                </Link>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="relative left-1/2 mt-8 flex w-screen -translate-x-1/2 justify-center select-none">
              <div className="inline-flex items-center justify-center gap-3">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={activePage === 1}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-outline text-secondary hover:bg-surface-container-low transition-colors ${
                    activePage === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {visiblePages.map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activePage === pageNum 
                        ? "bg-primary text-white scale-105 shadow-md" 
                        : "text-secondary hover:bg-surface-container-low"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={activePage === totalPages}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-outline text-secondary hover:bg-surface-container-low transition-colors ${
                    activePage === totalPages ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* QUICK VIEW POPUP MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-background rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/10 animate-scale-up">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 hover:bg-surface-container-high rounded-full shadow transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Image column */}
              <div className="relative aspect-square bg-surface-container">
                <img 
                  src={quickViewProduct.featuredImage.url} 
                  alt={quickViewProduct.featuredImage.altText || quickViewProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/kibbles/400/400";
                  }}
                />
              </div>

              {/* Right metadata description column */}
              <div className="p-6 sm:p-8 flex flex-col h-full bg-background justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#6a5f00] uppercase bg-[#6a5f00]/10 px-2 py-0.5 rounded">
                    {quickViewProduct.productType}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-on-surface mt-2.5 mb-2">
                    {quickViewProduct.title}
                  </h2>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-primary font-bold text-lg sm:text-xl">
                      {hasVariantPriceRange(quickViewProduct) ? "From " : ""}${parseFloat(quickViewProduct.priceRange.minVariantPrice.amount).toFixed(2)}
                    </span>
                    {quickViewProduct.compareAtPriceRange && parseFloat(quickViewProduct.compareAtPriceRange.minVariantPrice.amount) > 0 && (
                      <span className="text-xs text-secondary/40 line-through font-mono">
                        ${parseFloat(quickViewProduct.compareAtPriceRange.minVariantPrice.amount).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-6 line-clamp-4">
                    {quickViewProduct.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-2.5 bg-primary hover:opacity-95 text-on-primary rounded-full text-xs font-bold shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Pack Cart
                  </button>
                  <Link
                    href={`/products/${quickViewProduct.handle}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="block text-center py-2 text-xs font-bold text-secondary hover:text-primary transition-colors hover:underline"
                  >
                    View Product Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
