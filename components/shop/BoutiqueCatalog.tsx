"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  Check, 
  ShoppingCart, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Eye, 
  CheckSquare, 
  Square,
  Heart,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Collection, Product } from "@/types/shopify";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import { getDefaultVariant, getSelectedVariantAmount, hasVariantPriceRange } from "@/lib/pricing";

interface BoutiqueCatalogProps {
  initialProducts: Product[];
  initialCollections: Collection[];
}

function productMatchesCollectionHandle(product: Product, collectionHandle: string) {
  const handle = collectionHandle.toLowerCase();
  const tags = product.tags.map(tag => tag.toLowerCase());
  const collectionHandles = product.collections?.map(collection => collection.handle.toLowerCase()) || [];

  if (collectionHandles.includes(handle) || tags.includes(handle)) return true;

  const [petPrefix, ...rest] = handle.split("-");
  const collectionTag = rest.join("-");

  if ((petPrefix === "dog" || petPrefix === "cat") && collectionTag) {
    return tags.includes(petPrefix) && (
      tags.includes(collectionTag)
      || tags.includes(`${petPrefix}-${collectionTag}`)
      || product.productType.toLowerCase().replace(/\s+/g, "-") === collectionTag
    );
  }

  return tags.includes(collectionTag) || product.productType.toLowerCase().replace(/\s+/g, "-") === handle;
}

function productMatchesPetCategory(product: Product, category: string) {
  const normalizedCategory = category.toLowerCase();
  const tags = product.tags.map(tag => tag.toLowerCase());
  const collectionHandles = product.collections?.map(collection => collection.handle.toLowerCase()) || [];
  const collectionCategories = new Set<string>(
    collectionHandles
      .map((handle) => {
        if (handle === "dog" || handle.startsWith("dog-")) return "dog";
        if (handle === "cat" || handle.startsWith("cat-")) return "cat";
        return "";
      })
      .filter(Boolean),
  );

  if (collectionCategories.size > 0) {
    return collectionCategories.has(normalizedCategory);
  }

  return tags.includes(normalizedCategory);
}

function cleanCollectionLabel(title: string) {
  return title.replace(/^(dog|cat)\s+/i, "").trim();
}

function getProductTypeLabel(product: Product) {
  const normalizedProductType = product.productType.trim().toLowerCase();

  if (normalizedProductType && !["default", "essentials"].includes(normalizedProductType)) {
    return product.productType;
  }

  const collection = product.collections?.find(item => !["dog", "cat"].includes(item.handle.toLowerCase()));
  if (collection) return cleanCollectionLabel(collection.title);

  return product.productType || "Essentials";
}

function productTypeBelongsToCategory(typeLabel: string, category: string) {
  const normalizedType = typeLabel.trim().toLowerCase();

  if (category === "dog") return !normalizedType.startsWith("cat ");
  if (category === "cat") return !normalizedType.startsWith("dog ");

  return true;
}

function BoutiqueCatalogContent({ initialProducts }: BoutiqueCatalogProps) {
  const searchParams = useSearchParams();
  const categoryOptions = [
    { value: "dog", label: "Dogs" },
    { value: "cat", label: "Cats" },
  ].filter(option => initialProducts.some(product => productMatchesPetCategory(product, option.value)));

  // ----------------------------------------------------
  // Interactive Filter States
  // ----------------------------------------------------
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(300);
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("Newest Arrivals");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState<boolean>(false);
  const sortOptions = [
    "Newest Arrivals",
    "Best Selling",
    "Price: Low to High",
    "Price: High to Low"
  ];
  const itemsPerPageOptions = [10, 15, 20];
  
  // UI Layout States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartModalItem, setCartModalItem] = useState<{ product: Product; quantity: number; selectedVariantId: string } | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const hasActiveFilters = selectedCategories.length > 0
    || selectedTypes.length > 0
    || selectedTags.length > 0
    || selectedCollections.length > 0
    || priceRange < 300
    || Boolean(searchQuery);
  const selectedCategory = selectedCategories[0] || "";
  const productTypeOptions = selectedCategory
    ? Array.from(
        new Set(
          initialProducts
            .filter(product => productMatchesPetCategory(product, selectedCategory))
            .map(getProductTypeLabel)
            .filter(type => productTypeBelongsToCategory(type, selectedCategory))
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b))
    : [];

  useEffect(() => {
    if (!cartModalItem) return;
    const timer = window.setTimeout(() => setCartModalItem(null), 3500);
    return () => window.clearTimeout(timer);
  }, [cartModalItem]);

  // Sync state functions
  const syncWishlist = () => {
    setWishlistIds(getWishlist().map(item => item.id));
  };

  // Sync on mount & events
  useEffect(() => {
    syncWishlist();
    const handleStorage = () => syncWishlist();

    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Read initial query params
  useEffect(() => {
    const categoryQuery = searchParams.get("category");
    const typeQuery = searchParams.get("type");
    const tagQuery = searchParams.get("tag");
    const collectionQuery = searchParams.get("collection");
    const searchQueryParam = searchParams.get("search");
    const collectionHandles = collectionQuery
      ? collectionQuery.split(",").map(collection => collection.trim()).filter(collection => collection && collection !== "all")
      : [];
    const firstCollection = collectionHandles[0]?.toLowerCase() || "";
    const collectionCategory = firstCollection.startsWith("dog-")
      ? "dog"
      : firstCollection.startsWith("cat-")
        ? "cat"
        : "";

    setSelectedCategories(categoryQuery ? [categoryQuery] : collectionCategory ? [collectionCategory] : []);
    setSelectedTypes(typeQuery ? [typeQuery] : []);
    setSelectedTags(tagQuery ? tagQuery.split(",").map(tag => tag.trim()).filter(Boolean) : []);
    setSelectedCollections(collectionHandles);
    setSearchQuery(searchQueryParam || "");
    setCurrentPage(1);
  }, [searchParams]);

  // ----------------------------------------------------
  // Hardcoded items tags & badges details mapping
  // ----------------------------------------------------
  const getBadgeType = (product: Product) => {
    if (product.tags.includes("new")) return "new";
    if (product.tags.includes("sale") || product.compareAtPriceRange) return "sale";
    if (product.tags.includes("organic")) return "organic";
    return null;
  };

  const getCategoryLabel = (product: Product) => {
    const productTypeLabel = getProductTypeLabel(product);
    if (productTypeLabel && productTypeLabel !== "Essentials") return productTypeLabel.toUpperCase();

    if (product.tags.includes("treats") || product.tags.includes("food")) return "FOOD";
    if (product.tags.includes("dining") || product.tags.includes("bowl")) return "DINING";
    if (product.tags.includes("accessories") || product.tags.includes("harness") || product.tags.includes("leather")) return "ACCESSORIES";
    if (product.tags.includes("comfort") || product.tags.includes("bed")) return "COMFORT";
    if (product.tags.includes("toys") || product.tags.includes("rope")) return "TOYS";
    if (product.tags.includes("grooming") || product.tags.includes("brush")) return "GROOMING";
    return "ESSENTIALS";
  };

  // Select one pet category at a time.
  const toggleCategory = (category: string) => {
    setSelectedCategories([category]);
    setSelectedTypes([]);
    setSelectedCollections([]);
    setCurrentPage(1);
  };

  // Toggle Product Type Checkboxes
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedTags([]);
    setSelectedCollections([]);
    setPriceRange(300);
    setInStockOnly(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // ----------------------------------------------------
  // Dynamic Filtering & Sorting Logic
  // ----------------------------------------------------
  const filteredAndSortedProducts = initialProducts.filter(product => {
    // 1. Search Query check
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchTags = product.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // 2. Category tag check ("dog", "cat")
    if (selectedCategories.length > 0) {
      const matchCat = selectedCategories.some(cat => (
        productMatchesPetCategory(product, cat)
        && productTypeBelongsToCategory(getProductTypeLabel(product), cat)
      ));
      if (!matchCat) return false;
    }

    // 3. Product Type check
    if (selectedTypes.length > 0) {
      if (!selectedTypes.includes(getProductTypeLabel(product))) return false;
    }

    // 4. Product tag check
    if (selectedTags.length > 0) {
      const matchTag = selectedTags.some(tag => product.tags.includes(tag));
      if (!matchTag) return false;
    }

    // 5. Shopify collection handle check
    if (selectedCollections.length > 0) {
      const matchCollection = selectedCollections.some(collection => productMatchesCollectionHandle(product, collection));
      if (!matchCollection) return false;
    }

    // 6. Price range check
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    if (price > priceRange) return false;

    // 7. Availability/In stock check (Mock data items are all in stock initially)
    if (inStockOnly) {
      const variantInStock = product.variants.some(v => v.availableForSale);
      if (!variantInStock) return false;
    }

    return true;
  }).sort((a, b) => {
    const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
    const priceB = parseFloat(b.priceRange.minVariantPrice.amount);

    switch (sortOption) {
      case "Price: Low to High":
        return priceA - priceB;
      case "Price: High to Low":
        return priceB - priceA;
      case "Best Selling":
        const scoreA = a.tags.includes("best-seller") ? 2 : (a.tags.includes("featured") ? 1 : 0);
        const scoreB = b.tags.includes("best-seller") ? 2 : (b.tags.includes("featured") ? 1 : 0);
        return scoreB - scoreA;
      case "Newest Arrivals":
      default:
        const isNewA = a.tags.includes("new") ? 1 : 0;
        const isNewB = b.tags.includes("new") ? 1 : 0;
        if (isNewA !== isNewB) return isNewB - isNewA;
        return b.id.localeCompare(a.id); // Default stable fallback
    }
  });

  // Calculate Paginated variables
  const totalProducts = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  
  // Safe adjust page
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);
  const firstVisiblePage = Math.max(1, Math.min(activePage - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstVisiblePage + index,
  );

  const scrollToShopTop = () => {
    const shopTop = document.getElementById("shop-results-top");

    if (shopTop) {
      const headerOffset = 96;
      const top = shopTop.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(nextPage);
    scrollToShopTop();
  };

  // Add Item to Cart
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent opening quick view on card click
    }

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

    setCartModalItem({ product, quantity: 1, selectedVariantId });
  };

  return (
    <div className="bg-background text-on-surface">
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-5 md:px-16 py-8">
        
        {/* Breadcrumb path */}
        <div className="text-xs text-secondary/60 mb-6 flex items-center gap-1.5 font-medium tracking-wide">
          <span>Home</span>
          <span>/</span>
          <span className="text-secondary font-semibold">Our Boutique</span>
        </div>

        {/* Header Title Grid */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-secondary-container-dim/20 pb-8">
          <div>
            <h1 className="text-4xl md:text-[48px] font-heading font-bold text-on-background leading-normal tracking-tight">
              Our Boutique
            </h1>
            <p className="text-base text-secondary mt-2 leading-relaxed max-w-xl">
              Curated premium essentials for your companions, hand-crafted with organic precision.
            </p>
          </div>

          {/* Interactive controls bar */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Inline Search Bar */}
            <div className="relative flex items-center bg-surface-container-low border border-outline/10 text-xs px-4 py-2.5 rounded-full w-full sm:w-60 hover:border-outline/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-300">
              <Search className="w-4 h-4 text-secondary/70 mr-2" />
              <input 
                type="text"
                placeholder="Search boutique..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-sans w-full p-0 text-on-surface"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="ml-2 hover:text-primary transition-colors">
                  <X className="w-3.5 h-3.5 text-secondary" />
                </button>
              )}
            </div>

            {/* Sort Criteria Selection */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 border border-outline/10 rounded-full hover:border-outline/40 transition-all text-xs font-bold text-primary cursor-pointer active:scale-98 select-none"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-semibold text-secondary whitespace-nowrap">Sort:</span>
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  {sortOption}
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
                            setSortOption(option);
                            setIsSortOpen(false);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                            sortOption === option 
                              ? "bg-primary-container/20 text-primary font-bold" 
                              : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                          }`}
                        >
                          <span>{option}</span>
                          {sortOption === option && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Filter Toggled Trigger */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-bold text-xs"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Catalog Two-Column Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Section (Desktop) */}
          <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 select-none">
            
            {/* Filter Group: Category */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">
                Category
              </h3>
              <div className="space-y-3">
                {categoryOptions.map((category) => (
                  <label key={category.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="pet-category"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="border-outline-variant/60 accent-primary h-4.5 w-4.5 cursor-pointer"
                    />
                    <span className="text-sm text-secondary group-hover:text-primary transition-colors font-sans">
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Product Type */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">
                Product Type
              </h3>
              <div className="space-y-3">
                {selectedCategory ? (
                  productTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="rounded border-outline-variant/60 accent-primary h-4.5 w-4.5 cursor-pointer"
                      />
                      <span className="text-sm text-secondary group-hover:text-primary transition-colors font-sans">
                        {type}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-secondary/80 leading-relaxed">
                    Select Dogs or Cats to see matching product types.
                  </p>
                )}
              </div>
            </div>

            {/* Filter Group: Price Range */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1c]">
                  Price Range
                </h3>
                {priceRange < 300 && (
                  <span className="text-xs font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">
                    Max: ${priceRange}
                  </span>
                )}
              </div>
              <div className="px-1 space-y-2">
                <input 
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-xs text-secondary/70 font-mono">
                  <span>$0</span>
                  <span>$300+</span>
                </div>
              </div>
            </div>

            {/* Filter Group: Availability */}
            <div>
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

            {/* Clear All Option */}
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="w-full text-center border-2 border-dashed border-outline/20 hover:border-primary/40 text-xs font-bold text-secondary hover:text-primary py-3 rounded-full transition-colors font-sans"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Right Product Grid Column */}
          <div id="shop-results-top" className="flex-grow scroll-mt-28">
            {totalProducts === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline/20">
                <Info className="w-10 h-10 text-secondary/50 mx-auto mb-3" />
                <h4 className="text-lg font-bold">No Products Found</h4>
                <p className="text-sm text-secondary mt-1">
                  Try adjusting or clearing your filters parameters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex tracking-wider items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Reset filters and search
                </button>
              </div>
            ) : (
              <div>
                
                {/* Result metadata stats */}
                <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-secondary/70 mb-4 font-sans font-medium px-1">
                  <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Showing <span className="text-primary font-bold font-mono">{startIndex + 1}</span>–
                    <span className="text-primary font-bold font-mono">{endIndex}</span> of{" "}
                    <span className="text-primary font-bold font-mono">{totalProducts}</span> premium goods
                  </span>
                  
                  </div>

                  {/* Clean badge indicators */}
                  <div className="hidden sm:flex items-center gap-2">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        {cat}s
                      </span>
                    ))}
                    {selectedTypes.map(typ => (
                      <span key={typ} className="bg-tertiary-container text-on-tertiary-container px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        {typ}
                      </span>
                    ))}
                    {selectedTags.map(tag => (
                      <span key={tag} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        {tag}
                      </span>
                    ))}
                    {selectedCollections.map(collection => (
                      <span key={collection} className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        {collection.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>

                  <div className="relative ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
                      className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 border border-outline/10 rounded-full hover:border-outline/40 transition-all text-xs font-bold text-primary cursor-pointer active:scale-98 select-none"
                      aria-label="Products per page"
                    >
                      <span className="text-xs font-semibold text-secondary whitespace-nowrap">Show:</span>
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        {itemsPerPage}
                        <ChevronDown className={`w-3.5 h-3.5 text-primary transition-transform duration-200 ${isItemsPerPageOpen ? "rotate-180" : ""}`} />
                      </span>
                    </button>

                    <AnimatePresence>
                      {isItemsPerPageOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20 cursor-default"
                            onClick={() => setIsItemsPerPageOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 mt-2 w-28 bg-white border border-outline/10 rounded-xl shadow-[0px_10px_30px_rgba(90,96,90,0.08)] py-1.5 z-30 overflow-hidden"
                          >
                            {itemsPerPageOptions.map((count) => (
                              <button
                                key={count}
                                type="button"
                                onClick={() => {
                                  setItemsPerPage(count);
                                  setIsItemsPerPageOpen(false);
                                  setCurrentPage(1);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                                  itemsPerPage === count
                                    ? "bg-primary-container/20 text-primary font-bold"
                                    : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                                }`}
                              >
                                <span>{count}</span>
                                {itemsPerPage === count && (
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

                {/* Primary Bento/Gallery layout grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => {
                    const badge = getBadgeType(product);
                    const categoryLabel = getCategoryLabel(product);
                    const formattedPrice = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2);
                    const pricePrefix = hasVariantPriceRange(product) ? "From " : "";
                    const comparePrice = product.compareAtPriceRange 
                      ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount).toFixed(2)
                      : null;

                    return (
                      <div 
                        key={product.id} 
                        className="group flex flex-col relative transition-all duration-300 relative select-none"
                      >
                        {/* Image Frame Container */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#edeeee] mb-4 shadow-[0_4px_10px_rgba(90,96,90,0.02)] group-hover:shadow-[0_10px_30px_rgba(90,96,90,0.08)] group-hover:-translate-y-1 transition-all duration-300">
                          <Link href={`/products/${product.handle}`} className="block w-full h-full cursor-pointer">
                            <img 
                              src={product.featuredImage.url} 
                              alt={product.featuredImage.altText || product.title}
                              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-in-out"
                              loading="lazy"
                              onError={(e) => {
                                // Safe fallback for remote pictures
                                e.currentTarget.src = "https://picsum.photos/seed/petbowl/400/400";
                              }}
                            />
                          </Link>

                          {/* Float Badges */}
                          {badge && (
                            <div className="absolute top-3 left-3">
                              {badge === "new" && (
                                <span className="bg-primary text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                                  New
                                </span>
                              )}
                              {badge === "organic" && (
                                <span className="bg-[#526161] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                                  Organic
                                </span>
                              )}
                              {badge === "sale" && (
                                <span className="bg-error text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                                  Sale
                                </span>
                              )}
                            </div>
                          )}

                          {/* Quick Peek Float Icon */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setQuickViewProduct(product);
                            }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded-full shadow-sm text-secondary hover:text-primary cursor-pointer"
                            aria-label="Quick preview product pop-up"
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
                            className={`absolute top-3 right-11 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm cursor-pointer z-10 ${
                              wishlistIds.includes(product.id)
                                ? "bg-white text-primary scale-105"
                                : "bg-white/90 hover:bg-white text-secondary hover:text-primary"
                            }`}
                            aria-label="Toggle favorite wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${wishlistIds.includes(product.id) ? "fill-primary text-primary" : ""}`} />
                          </button>

                          {/* Dynamic Add to Cart overlay from screen specification */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleAddToCart(product, e);
                            }}
                            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all bg-white hover:bg-primary text-secondary hover:text-white p-2.5 rounded-full shadow-lg cursor-pointer z-10"
                            aria-label="Add immediately to shopping cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Description labels */}
                        <Link href={`/products/${product.handle}`} className="cursor-pointer block">
                          <p className="text-[10px] sm:text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">
                            {categoryLabel}
                          </p>
                          
                          <h3 className="text-sm sm:text-base font-bold text-[#191c1c] group-hover:text-primary transition-colors line-clamp-1 mb-1 font-sans">
                            {product.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            <p className="text-primary font-bold text-sm sm:text-base font-sans">
                              {pricePrefix}${formattedPrice}
                            </p>
                            {comparePrice && (
                              <p className="text-xs text-secondary/40 line-through font-mono">
                                ${comparePrice}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Paginator */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center">
                    <div className="inline-flex items-center justify-center gap-2">
                      <button 
                        onClick={() => goToPage(activePage - 1)}
                        disabled={activePage === 1}
                        className="p-2 border border-outline/10 hover:border-primary rounded-full text-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {visiblePages.map((pageNum) => {
                        const isActive = activePage === pageNum;

                        return (
                          <button 
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all ${
                              isActive 
                                ? "bg-primary text-white shadow-md animate-fade-in" 
                                : "hover:bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button 
                        onClick={() => goToPage(activePage + 1)}
                        disabled={activePage === totalPages}
                        className="p-2 border border-outline/10 hover:border-primary rounded-full text-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------
          Interactive Drawer: Mobile Responsive Filters
          ---------------------------------------------------- */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop mask layer */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          ></div>

          {/* Sidedrawer container */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-background py-6 px-6 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-outline/10">
              <h2 className="text-base font-bold text-on-surface uppercase tracking-wider">
                Sort & Filter
              </h2>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-secondary hover:text-primary transition-colors"
                aria-label="Close interactive filters panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Checkboxes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                  Category
                </h3>
                <div className="space-y-3">
                  {categoryOptions.map((category) => (
                    <label key={category.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="mobile-pet-category"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        className="border-outline-variant/60 accent-primary h-5 w-5 cursor-pointer"
                      />
                      <span className="text-sm text-secondary">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product Type checkboxes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                  Product Type
                </h3>
                <div className="space-y-3">
                  {selectedCategory ? (
                    productTypeOptions.map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="rounded border-outline-variant/60 accent-primary h-5 w-5 cursor-pointer"
                        />
                        <span className="text-sm text-secondary">{type}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-secondary/80 leading-relaxed">
                      Select Dogs or Cats to see matching product types.
                    </p>
                  )}
                </div>
              </div>

              {/* Slider for price */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#191c1c]">
                    Price Limit
                  </h3>
                  <span className="text-xs font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">
                    ${priceRange} max
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1 bg-secondary-container appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-xs text-secondary/60 font-mono mt-1">
                  <span>$0</span>
                  <span>$300+</span>
                </div>
              </div>

              {/* Availability check */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
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
                    className="rounded border-outline-variant/60 accent-primary h-5 w-5 cursor-pointer"
                  />
                  <span className="text-sm text-secondary font-medium">In Stock Only</span>
                </label>
              </div>

              <div className="pt-4 space-y-2">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full bg-primary text-white text-xs font-bold py-3.5 rounded-full hover:bg-opacity-95 text-center shadow"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => {
                    clearAllFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="w-full border border-outline/20 text-secondary text-xs font-bold py-3.5 rounded-full hover:bg-secondary/5 text-center"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          Interactive Modal: Quick Product View (Details & Shopify note)
          ---------------------------------------------------- */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
            onClick={() => setQuickViewProduct(null)}
          ></div>

          {/* Modal box */}
          <div className="relative bg-background max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto">
            
            {/* Left image column */}
            <div className="relative md:w-1/2 aspect-square md:aspect-auto bg-[#edeeee]">
              <img 
                src={quickViewProduct.featuredImage.url} 
                alt={quickViewProduct.featuredImage.altText || quickViewProduct.title}
                className="w-full h-full object-contain p-4"
              />
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 left-4 md:hidden bg-white/80 p-1.5 rounded-full text-secondary hover:text-primary shadow"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Right details column */}
            <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between space-y-4">
              
              {/* Core info header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-secondary uppercase bg-secondary-container/35 px-2 py-0.5 rounded">
                    {quickViewProduct.productType}
                  </span>
                  <button 
                    onClick={() => setQuickViewProduct(null)}
                    className="hidden md:block text-secondary hover:text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-xl md:text-2xl font-heading font-bold text-[#191c1c] leading-snug">
                  {quickViewProduct.title}
                </h2>
                
                <p className="text-[#6a5f00] font-sans font-bold text-lg mt-1.5">
                  {hasVariantPriceRange(quickViewProduct) ? "From " : ""}${parseFloat(quickViewProduct.priceRange.minVariantPrice.amount).toFixed(2)}
                </p>

                <p className="text-xs md:text-sm text-secondary/80 leading-relaxed mt-3.5">
                  {quickViewProduct.description}
                </p>
              </div>

              {/* Shopify Integration Notice Placeholder box */}
              <div className="bg-tertiary/5 border border-tertiary/20 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <span>Shopify Storefront API Ready</span>
                </div>
                <p className="text-[10px] text-secondary/70 leading-relaxed">
                  Placeholder variants configured. Production setup utilizes queries like <code className="font-mono text-primary font-semibold text-[9px] bg-primary/5 p-0.5 rounded">getProductByHandle("{quickViewProduct.handle}")</code> to render real inventory seamlessly.
                </p>
              </div>

              {/* Checkout actions */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-primary text-white text-xs font-bold py-3.5 rounded-full hover:bg-opacity-95 shadow transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add To Basket
                </button>
                <button 
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full text-center text-xs font-semibold text-secondary hover:text-primary py-1"
                >
                  Continue Browsing
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          Interactive Modal: Added to Cart Toast Alert
          ---------------------------------------------------- */}
      {cartModalItem && (
        <div className="fixed bottom-24 right-6 z-50 bg-background max-w-sm w-[calc(100%-3rem)] p-4 rounded-2xl shadow-2xl border border-secondary-container-highest animate-slide-in flex gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
            <img 
              src={cartModalItem.product.featuredImage.url} 
              alt={cartModalItem.product.title} 
              className="w-full h-full object-contain p-2"
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
              <span className="text-[10px] text-secondary font-mono">Qty: 1</span>
              <span className="text-xs font-bold text-primary">${getSelectedVariantAmount(cartModalItem.product, cartModalItem.selectedVariantId).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Fallback skeleton loader
function BoutiqueCatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-8 animate-pulse space-y-8 select-none">
      <div className="h-4 w-32 bg-secondary/10 rounded"></div>
      <div className="flex justify-between items-end border-b border-secondary/10 pb-8">
        <div className="space-y-3">
          <div className="h-10 w-48 bg-secondary/15 rounded"></div>
          <div className="h-4 w-96 bg-secondary/10 rounded"></div>
        </div>
        <div className="h-10 w-64 bg-secondary/10 rounded-full"></div>
      </div>
      <div className="flex gap-8">
        <div className="hidden md:block w-64 space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-16 bg-secondary/15 rounded"></div>
              <div className="h-5 w-full bg-secondary/10 rounded"></div>
              <div className="h-5 w-24 bg-secondary/10 rounded"></div>
            </div>
          ))}
        </div>
        <div className="flex-grow grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-secondary/10 rounded-2xl"></div>
              <div className="h-3 w-16 bg-secondary/10 rounded"></div>
              <div className="h-5 w-full bg-secondary/15 rounded"></div>
              <div className="h-4 w-12 bg-secondary/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BoutiqueCatalog({ initialProducts, initialCollections }: BoutiqueCatalogProps) {
  return (
    <Suspense fallback={<BoutiqueCatalogSkeleton />}>
      <BoutiqueCatalogContent initialProducts={initialProducts} initialCollections={initialCollections} />
    </Suspense>
  );
}
