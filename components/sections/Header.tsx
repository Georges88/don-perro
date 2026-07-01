"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown } from "lucide-react";
import { getWishlist } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";

const PET_MENU_ITEMS = {
  dog: [
    { label: "Dog Food", href: "/shop?category=dog&type=Organic%20Food" },
    { label: "Dog Treats", href: "/shop?category=dog&type=Treats" },
    { label: "Dog Toys", href: "/shop?category=dog&type=Interactive%20Toys" },
    { label: "Dog Accessories", href: "/shop?category=dog&type=Accessories" },
  ],
  cat: [
    { label: "Cat Food", href: "/shop?category=cat&type=Organic%20Food" },
    { label: "Cat Treats", href: "/shop?category=cat&type=Treats" },
    { label: "Cat Toys", href: "/shop?category=cat&type=Interactive%20Toys" },
    { label: "Cat Accessories", href: "/shop?category=cat&type=Accessories" },
  ],
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active navigation queries
  const isShopAllActive = pathname === "/shop" && !searchParams.get("category") && !searchParams.get("sort");
  const isDogsActive = pathname === "/shop" && searchParams.get("category") === "dog";
  const isCatsActive = pathname === "/shop" && searchParams.get("category") === "cat";
  const isNewArrivalsActive = pathname === "/shop" && searchParams.get("sort") === "Newest Arrivals";

  const isWishlistActive = pathname === "/wishlist";
  const isCartActive = pathname === "/cart";
  const isAccountActive = pathname === "/account";
  const isSearchActive = pathname === "/search";

  const updateCartCount = () => {
    try {
      const savedCart = localStorage.getItem("don_perro_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const count = parsed.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(count);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setCartCount(0);
  };

  const updateWishlistCount = () => {
    try {
      const list = getWishlist();
      setWishlistCount(list.length);
    } catch (e) {
      console.error(e);
    }
  };

  const updateAuthState = () => {
    setIsAuthenticated(Boolean(getCurrentUser()));
  };

  const updateServerAuthState = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        updateAuthState();
        return;
      }

      const payload = await response.json();
      setIsAuthenticated(Boolean(payload.authenticated));
    } catch (e) {
      console.error(e);
      updateAuthState();
    }
  };

  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
    updateServerAuthState();

    const handleStorageChange = () => {
      updateCartCount();
      updateWishlistCount();
      updateServerAuthState();
    };

    // Listen to local storage changes and custom events
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("wishlist-updated", updateWishlistCount);
    window.addEventListener("auth-updated", updateServerAuthState);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("wishlist-updated", updateWishlistCount);
      window.removeEventListener("auth-updated", updateServerAuthState);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search?q=Kibble");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-secondary-container/20 shadow-[0px_10px_30px_rgba(90,96,90,0.05)] transition-all duration-300">
      <nav className="flex justify-between items-center w-full px-6 md:px-16 max-w-7xl mx-auto h-20">
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-bold font-heading text-primary hover:opacity-90 transition-opacity">
          Don Perro
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/shop" 
            className={`text-sm font-semibold tracking-wide font-sans transition-colors duration-200 ${
              isShopAllActive 
                ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary font-bold" 
                : "text-secondary hover:text-primary"
            }`}
          >
            Shop All
          </Link>
          <div className="group relative">
            <Link 
              href="/shop?category=dog" 
              className={`inline-flex items-center gap-1 text-sm font-semibold tracking-wide font-sans transition-colors duration-200 ${
                isDogsActive 
                  ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary font-bold" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Dogs
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-xl border border-outline/10 bg-white py-1.5 shadow-[0px_14px_35px_rgba(90,96,90,0.12)]">
                {PET_MENU_ITEMS.dog.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-bold text-secondary transition-colors hover:bg-primary-container/15 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="group relative">
            <Link 
              href="/shop?category=cat" 
              className={`inline-flex items-center gap-1 text-sm font-semibold tracking-wide font-sans transition-colors duration-200 ${
                isCatsActive 
                  ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary font-bold" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Cats
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-xl border border-outline/10 bg-white py-1.5 shadow-[0px_14px_35px_rgba(90,96,90,0.12)]">
                {PET_MENU_ITEMS.cat.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-bold text-secondary transition-colors hover:bg-primary-container/15 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link 
            href="/shop?sort=Newest+Arrivals" 
            className={`text-sm font-semibold tracking-wide font-sans transition-colors duration-200 ${
              isNewArrivalsActive 
                ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary font-bold" 
                : "text-secondary hover:text-primary"
            }`}
          >
            New Arrivals
          </Link>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-4">
          
          {/* Desktop Search input field styled exactly to mockup specs */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block" id="nav-search-form">
            <input 
              type="text" 
              placeholder="Kibble"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-surface-container/60 hover:bg-surface-container border text-xs text-on-surface rounded-full py-2 pl-9 pr-4 focus:ring-1 focus:ring-primary outline-none w-60 transition-all font-medium ${
                isSearchActive ? "border-primary/40 ring-1 ring-primary/20" : "border-transparent"
              }`}
            />
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
              isSearchActive ? "text-primary" : "text-secondary/80"
            }`} />
          </form>

          <Link
            href="/search"
            className={`p-2 transition-all rounded-full border ${
              isSearchActive 
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
                : "text-secondary hover:text-primary hover:bg-secondary/5 border-transparent"
            } lg:hidden`}
            aria-label="Search Catalog"
          >
            <Search className="w-5 h-5" />
          </Link>
          
          <Link 
            href="/wishlist"
            className={`p-2 transition-all relative rounded-full border ${
              isWishlistActive 
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
                : "text-secondary hover:text-primary hover:bg-secondary/5 border-transparent"
            }`}
            aria-label="Wishlist Favorites"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] px-1 bg-primary text-[10px] leading-none tabular-nums text-white rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link 
            href="/cart"
            className={`p-2 transition-all relative rounded-full border ${
              isCartActive 
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
                : "text-secondary hover:text-primary hover:bg-secondary/5 border-transparent"
            }`}
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] px-1 bg-primary text-[10px] leading-none tabular-nums text-white rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <Link 
            href={isAuthenticated ? "/account" : "/login"}
            className={`hidden sm:inline-flex p-2 transition-all rounded-full border ${
              isAccountActive 
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
                : "text-secondary hover:text-primary hover:bg-secondary/5 border-transparent"
            }`}
            aria-label={isAuthenticated ? "User Account" : "Sign In"}
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-secondary hover:text-primary transition-all rounded-full hover:bg-secondary/5"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-secondary-container-dim/50 shadow-lg py-6 px-6 z-40 animate-fade-in animate-duration-200">
          <div className="flex flex-col gap-4">
            <Link 
              href="/shop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 border-b border-secondary-container/10 transition-all ${
                isShopAllActive 
                  ? "text-primary border-l-4 border-primary pl-3 bg-primary/5" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Shop All
            </Link>
            <Link 
              href="/shop?category=dog" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 transition-all ${
                isDogsActive 
                  ? "text-primary border-l-4 border-primary pl-3 bg-primary/5" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Dogs
            </Link>
            <div className="border-b border-secondary-container/10 pb-2 pl-4">
              {PET_MENU_ITEMS.dog.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-secondary/85 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link 
              href="/shop?category=cat" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 transition-all ${
                isCatsActive 
                  ? "text-primary border-l-4 border-primary pl-3 bg-primary/5" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Cats
            </Link>
            <div className="border-b border-secondary-container/10 pb-2 pl-4">
              {PET_MENU_ITEMS.cat.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-secondary/85 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link 
              href="/shop?sort=Newest+Arrivals" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 border-b border-secondary-container/10 transition-all ${
                isNewArrivalsActive 
                  ? "text-primary border-l-4 border-primary pl-3 bg-primary/5" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              New Arrivals
            </Link>
            <Link 
              href="/wishlist" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 border-b border-secondary-container/10 transition-all flex justify-between items-center ${
                isWishlistActive 
                  ? "text-primary border-l-4 border-primary pl-3 bg-primary/5" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isWishlistActive ? "text-primary" : "text-secondary"}`} /> 
                My Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-xs text-white rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link 
              href={isAuthenticated ? "/account" : "/login"} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-2 mt-2 transition-all flex items-center gap-2 ${
                isAccountActive 
                  ? "text-primary pl-3 border-l-4 border-primary bg-primary/5" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              <User className={`w-5 h-5 ${isAccountActive ? "text-primary" : "text-secondary"}`} /> 
              {isAuthenticated ? "My Account" : "Sign In"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
