"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ShoppingCart, 
  CheckSquare, 
  Square, 
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

interface SearchResultsProps {
  products: Product[];
}

export default function SearchResults({ products }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL search query
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  // ----------------------------------------------------
  // Interactive Local Filter States
  // ----------------------------------------------------
  const [searchInput, setSearchInput] = useState(queryParam || "Kibble");
  const [activeQuery, setActiveQuery] = useState(queryParam || "Kibble");
  
  // Selected categories (Dry Food, Wet Food, Freeze Dried)
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>(["Dry Food"]);
  
  // Price Range
  const [priceLimit, setPriceLimit] = useState<number>(150);

  // Health Goals (Organic, Grain-Free, Sensitive Stomach)
  const [healthGoals, setHealthGoals] = useState<string[]>(["Organic"]);

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
    if (searchParams.get("q")) {
      const q = searchParams.get("q") || "";
      setSearchInput(q);
      setActiveQuery(q);
    }
    syncWishlist();

    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, [searchParams]);

  // Handle Search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveQuery(searchInput);
    setCurrentPage(1);
    // Update URL query string
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchInput);
    router.push(`/search?${params.toString()}`);
  };

  // Get count of products in each Food Type (for sidebar labels)
  const getTypeCount = (type: string) => {
    return products.filter(p => p.productType === type).length;
  };

  // Toggle food types
  const toggleFoodType = (type: string) => {
    setSelectedFoodTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  // Toggle health goals
  const toggleHealthGoal = (goal: string) => {
    setHealthGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFoodTypes([]);
    setHealthGoals([]);
    setPriceLimit(150);
    setSearchInput("");
    setActiveQuery("");
    setCurrentPage(1);
    // Update URL query string
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`/search?${params.toString()}`);
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(product => {
    // 1. Text Search matching title, description, or tags
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchTags = product.tags.some(t => t.toLowerCase().includes(q));
      const matchType = product.productType.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchType) return false;
    }

    // 2. Sidebar food types (Dry Food, Wet Food, Freeze Dried)
    if (selectedFoodTypes.length > 0) {
      if (!selectedFoodTypes.includes(product.productType)) return false;
    }

    // 3. Price Filter
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    if (price > priceLimit) return false;

    // 4. Health Goals
    // Organic maps to "organic" tag
    // Grain-Free maps to "grain-free" tag
    // Sensitive Stomach maps to "sensitive-stomach" tag
    if (healthGoals.length > 0) {
      const hasAllSelectedGoals = healthGoals.every(goal => {
        if (goal === "Organic") return product.tags.includes("organic");
        if (goal === "Grain-Free") return product.tags.includes("grain-free");
        if (goal === "Sensitive Stomach") return product.tags.includes("sensitive-stomach");
        return true;
      });
      if (!hasAllSelectedGoals) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="max-w-7xl mx-auto px-6 md:px-16 pt-32 pb-24 font-sans text-on-surface">
      
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

      {/* Header section with query summary & active filters */}
      <header className="mb-8" id="search-results-header">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl md:text-3.5xl font-bold font-heading tracking-tight">
              {activeQuery ? `Results for "${activeQuery}"` : "All Products"}
            </h1>
            <span className="text-secondary text-sm font-medium">({totalItems} items)</span>
          </div>

          {/* Quick bar search form for direct editing on the page */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs block sm:hidden">
            <input 
              type="text" 
              placeholder="Search catalog..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full py-2 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          </form>
        </div>

        {/* Active Filter Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(selectedFoodTypes.length > 0 || healthGoals.length > 0) && (
            <span className="text-secondary font-semibold mr-1">Active filters:</span>
          )}
          {selectedFoodTypes.map(type => (
            <button
              key={type}
              onClick={() => toggleFoodType(type)}
              className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors px-3 py-1 rounded-full font-medium flex items-center gap-1 cursor-pointer select-none"
            >
              {type}
              <X className="w-3 h-3 text-[#5a605a] ml-0.5" />
            </button>
          ))}
          {healthGoals.map(goal => (
            <button
              key={goal}
              onClick={() => toggleHealthGoal(goal)}
              className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors px-3 py-1 rounded-full font-medium flex items-center gap-1 cursor-pointer select-none"
            >
              {goal}
              <X className="w-3 h-3 text-[#5a605a] ml-0.5" />
            </button>
          ))}
          {(selectedFoodTypes.length > 0 || healthGoals.length > 0 || priceLimit < 150) && (
            <button 
              onClick={clearAllFilters}
              className="text-primary font-bold hover:underline transition-all ml-1 text-xs cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
        
        {/* Sidebar Filter Panel */}
        <aside className="hidden lg:flex flex-col gap-8 sticky top-32 bg-surface-container-lowest/40 p-5 rounded-2xl border border-secondary-container/50">
          
          {/* Categories / Food Types */}
          <div id="filter-category-section">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface mb-4 font-sans">
              Category
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Dry Food", count: getTypeCount("Dry Food") },
                { name: "Wet Food", count: getTypeCount("Wet Food") },
                { name: "Freeze Dried", count: getTypeCount("Freeze Dried") }
              ].map(cat => {
                const isSelected = selectedFoodTypes.includes(cat.name);
                return (
                  <li 
                    key={cat.name} 
                    onClick={() => toggleFoodType(cat.name)}
                    className="flex items-center justify-between group cursor-pointer text-sm select-none"
                  >
                    <span className={`transition-colors font-medium ${
                      isSelected 
                        ? "text-primary font-bold decoration-primary underline-offset-4" 
                        : "text-secondary group-hover:text-primary"
                    }`}>
                      {cat.name}
                    </span>
                    <span className="text-[11px] font-mono text-secondary/70 bg-surface-container px-2 py-0.5 rounded-md font-bold">
                      {cat.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/20" />

          {/* Price Range Slider */}
          <div id="filter-price-section">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface mb-4 font-sans">
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

          {/* Health Goals */}
          <div id="filter-health-section">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface mb-4 font-sans">
              Health Goal
            </h3>
            <div className="space-y-3">
              {[
                { name: "Organic", label: "Organic" },
                { name: "Grain-Free", label: "Grain-Free" },
                { name: "Sensitive Stomach", label: "Sensitive Stomach" }
              ].map(goal => {
                const isChecked = healthGoals.includes(goal.name);
                return (
                  <label 
                    key={goal.name}
                    className="flex items-center gap-2.5 cursor-pointer text-sm text-secondary hover:text-on-surface transition-colors select-none font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => toggleHealthGoal(goal.name)}
                      className="text-primary focus:outline-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-primary fill-primary-container/20" />
                      ) : (
                        <Square className="w-5 h-5 text-outline/40" />
                      )}
                    </button>
                    <span className={isChecked ? "text-on-surface font-semibold" : ""}>{goal.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </aside>

        {/* Results Main Section */}
        <section className="flex flex-col gap-6">
          
          {/* Controls Row */}
          <div className="flex justify-between items-center bg-surface-container-lowest border border-outline-variant/10 p-3.5 sm:p-4 rounded-2xl shadow-[0_4px_12px_rgba(90,96,90,0.01)]">
            
            {/* Mobile Filter Toggle Button */}
            <button 
              onClick={() => {
                // Open a quick filter options overlay on mobile
                setSelectedFoodTypes(prev => prev.length === 0 ? ["Dry Food"] : prev);
                const showM = !activeQuery; // Mock action or opens filter drawer
              }}
              className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-container/10 border border-primary/20 py-1.5 px-3 rounded-full hover:bg-primary-container/20 transition-all select-none"
              id="filter-mobile-toggle"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Toggle Filters
            </button>

            {/* Pagination helper info */}
            <div className="hidden sm:inline-block text-xs font-semibold text-secondary/80">
              Showing <span className="text-on-surface font-bold">{totalItems === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</span> of <span className="text-on-surface font-bold">{totalItems}</span> products
            </div>

            {/* Sorting SELECT dropdown */}
            <div className="relative flex items-center gap-2 ml-auto text-xs sm:text-sm">
              <span className="hidden sm:inline text-xs font-semibold text-secondary">Sort by:</span>
              <button 
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 bg-surface-container-low px-4 py-2 border border-outline/10 rounded-full hover:border-outline/40 transition-all text-xs font-bold text-on-surface cursor-pointer active:scale-98 select-none"
              >
                <span>{sortBy}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
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
                      className="absolute right-0 mt-12 w-48 bg-white border border-outline/10 rounded-xl shadow-[0px_10px_30px_rgba(90,96,90,0.08)] py-1.5 z-30 overflow-hidden"
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

          {/* Grid of Product Cards */}
          {totalItems > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" id="search-results-grid">
              {currentItems.map(product => {
                const badge = getBadge(product);
                const price = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2);
                const pricePrefix = hasVariantPriceRange(product) ? "From " : "";
                const hasCompare = product.compareAtPriceRange && parseFloat(product.compareAtPriceRange.minVariantPrice.amount) > 0;
                const comparePrice = hasCompare ? parseFloat(product.compareAtPriceRange!.minVariantPrice.amount).toFixed(2) : null;

                return (
                  <div 
                    key={product.id}
                    className="group flex flex-col bg-surface-container-lowest p-2.5 sm:p-3.5 rounded-2xl border border-secondary/15 transition-all duration-300 hover:shadow-[0px_10px_30px_rgba(90,96,90,0.08)] hover:-translate-y-1 relative"
                  >
                    {/* Image Frame with Link to details */}
                    <div className="relative aspect-square overflow-hidden bg-surface-container rounded-xl mb-3.5">
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
                    <Link href={`/products/${product.handle}`} className="flex flex-col flex-grow cursor-pointer">
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
            <div className="mt-8 flex justify-center items-center gap-3 select-none">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-outline text-secondary hover:bg-surface-container-low transition-colors ${
                  currentPage === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum 
                      ? "bg-primary text-white scale-105 shadow-md" 
                      : "text-secondary hover:bg-surface-container-low"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-outline text-secondary hover:bg-surface-container-low transition-colors ${
                  currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
