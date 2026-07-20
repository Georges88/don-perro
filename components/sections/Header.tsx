"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown } from "lucide-react";
import { getWishlist } from "@/lib/wishlist";
import { getCurrentUser } from "@/lib/auth";
import type { MenuItem } from "@/types/shopify";

const FALLBACK_NAV_ITEMS: MenuItem[] = [
  { label: "Shop All", href: "/shop", items: [] },
  {
    label: "Dogs",
    href: "/shop?category=dog",
    items: [
      { label: "Dog Food", href: "/shop?category=dog&type=Organic%20Food", items: [] },
      { label: "Dog Treats", href: "/shop?category=dog&type=Treats", items: [] },
      { label: "Dog Toys", href: "/shop?category=dog&type=Interactive%20Toys", items: [] },
      { label: "Dog Accessories", href: "/shop?category=dog&type=Accessories", items: [] },
    ],
  },
  {
    label: "Cats",
    href: "/shop?category=cat",
    items: [
      { label: "Cat Food", href: "/shop?category=cat&type=Organic%20Food", items: [] },
      { label: "Cat Treats", href: "/shop?category=cat&type=Treats", items: [] },
      { label: "Cat Toys", href: "/shop?category=cat&type=Interactive%20Toys", items: [] },
      { label: "Cat Accessories", href: "/shop?category=cat&type=Accessories", items: [] },
    ],
  },
  { label: "New Arrivals", href: "/shop?sort=Newest+Arrivals", items: [] },
];

const CART_STORAGE_KEY = "don_perro_cart";
const PENDING_CHECKOUT_KEY = "don_perro_pending_checkout";

function createStoredCartFingerprint() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = savedCart ? JSON.parse(savedCart) : [];

    if (!Array.isArray(parsed)) return "";

    return parsed
      .map((item) => `${item.selectedVariantId || ""}:${item.quantity || 1}`)
      .sort()
      .join("|");
  } catch {
    return "";
  }
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [navItems, setNavItems] = useState<MenuItem[]>(FALLBACK_NAV_ITEMS);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active navigation queries
  const isWishlistActive = pathname === "/wishlist";
  const isCartActive = pathname === "/cart";
  const isAccountActive = pathname === "/account";
  const isSearchActive = pathname === "/search";

  const isSelfNavItemActive = (item: MenuItem) => {
    if (item.href === "/shop") {
      return pathname === "/shop"
        && !searchParams.get("category")
        && !searchParams.get("sort")
        && !searchParams.get("tag")
        && !searchParams.get("collection");
    }

    if (item.href.startsWith("/shop?")) {
      const params = new URLSearchParams(item.href.split("?")[1]);
      return pathname === "/shop" && Array.from(params.entries()).every(([key, value]) => searchParams.get(key) === value);
    }

    return pathname === item.href;
  };

  const activeNavKey = (() => {
    const directMatch = navItems.find(isSelfNavItemActive);
    if (directMatch) return `${directMatch.label}-${directMatch.href}`;

    const childMatch = navItems.find(item => item.items.some(isSelfNavItemActive));
    if (childMatch) return `${childMatch.label}-${childMatch.href}`;

    return "";
  })();

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

  const clearCartAfterCompletedCheckout = async () => {
    try {
      const pendingRaw = localStorage.getItem(PENDING_CHECKOUT_KEY);
      if (!pendingRaw) return;

      const pending = JSON.parse(pendingRaw) as { startedAt?: string; cartFingerprint?: string };
      if (!pending.startedAt || !pending.cartFingerprint) {
        localStorage.removeItem(PENDING_CHECKOUT_KEY);
        return;
      }

      if (createStoredCartFingerprint() !== pending.cartFingerprint) {
        localStorage.removeItem(PENDING_CHECKOUT_KEY);
        return;
      }

      const ordersResponse = await fetch("/api/account/orders", { cache: "no-store" });
      if (!ordersResponse.ok) return;

      const payload = await ordersResponse.json();
      const orders = Array.isArray(payload.orders) ? payload.orders : [];
      const checkoutStartedAt = new Date(pending.startedAt).getTime() - 10 * 60 * 1000;
      const hasNewOrder = orders.some((order) => {
        const processedAt = typeof order.processedAt === "string" ? new Date(order.processedAt).getTime() : 0;
        return Number.isFinite(processedAt) && processedAt >= checkoutStartedAt;
      });

      if (!hasNewOrder) return;

      localStorage.setItem(CART_STORAGE_KEY, "[]");
      localStorage.removeItem(PENDING_CHECKOUT_KEY);
      updateCartCount();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Unable to clear cart after checkout", error);
    }
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
    clearCartAfterCompletedCheckout();

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

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const response = await fetch("/api/menu?handle=main-menu", { cache: "no-store" });
        if (!response.ok) return;

        const payload = await response.json();
        const items = payload?.menu?.items;

        if (isMounted && Array.isArray(items) && items.length > 0) {
          setNavItems(items);
        }
      } catch (error) {
        console.error("Unable to load Shopify menu", error);
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (pathname === "/search") {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [pathname, searchParams]);

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);

    const trimmedValue = value.trim();
    if (trimmedValue) {
      router.replace(`/search?q=${encodeURIComponent(trimmedValue)}`);
      return;
    }

    if (pathname === "/search") {
      router.replace("/search");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-secondary-container/20 shadow-[0px_10px_30px_rgba(90,96,90,0.05)] transition-all duration-300">
      <nav className="flex justify-between items-center w-full px-6 md:px-16 max-w-7xl mx-auto h-24">
        {/* Brand Logo */}
        <Link href="/" className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl hover:opacity-90 transition-opacity" aria-label="Don Perro home">
          <img
            src="/images/don-perro-navbar-logo.png"
            alt="Don Perro Food & More"
            className="block h-full w-full object-contain"
          />
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const navKey = `${item.label}-${item.href}`;
            const isActive = activeNavKey === navKey;

            if (item.items.length === 0) {
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className={`text-sm font-semibold tracking-wide font-sans transition-colors duration-200 ${
                    isActive
                      ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary font-bold"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div key={`${item.label}-${item.href}`} className="group relative">
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 text-sm font-semibold tracking-wide font-sans transition-colors duration-200 ${
                    isActive
                      ? "text-primary underline underline-offset-[6px] decoration-2 decoration-primary font-bold"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-outline/10 bg-white py-1.5 shadow-[0px_14px_35px_rgba(90,96,90,0.12)]">
                    {item.items.map((child) => (
                      <Link
                        key={`${child.label}-${child.href}`}
                        href={child.href}
                        className="block px-4 py-2.5 text-xs font-bold text-secondary transition-colors hover:bg-primary-container/15 hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-4">
          
          {/* Desktop Search input field styled exactly to mockup specs */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block" id="nav-search-form">
            <input 
              type="text" 
              placeholder="Kibble"
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className={`bg-surface-container/60 hover:bg-surface-container border text-xs text-on-surface rounded-full py-2 pl-9 pr-4 focus:ring-1 focus:ring-primary outline-none w-60 transition-all font-medium ${
                isSearchActive ? "border-primary/40 ring-1 ring-primary/20" : "border-transparent"
              }`}
            />
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
              isSearchActive ? "text-primary" : "text-secondary/80"
            }`} />
          </form>

          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen((value) => !value);
              setIsMobileMenuOpen(false);
            }}
            className={`p-2 transition-all rounded-full border ${
              isSearchActive || isMobileSearchOpen
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm" 
                : "text-secondary hover:text-primary hover:bg-secondary/5 border-transparent"
            } lg:hidden`}
            aria-label="Search Catalog"
          >
            <Search className="w-5 h-5" />
          </button>
          
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

      {isMobileSearchOpen && (
        <div className="lg:hidden border-t border-secondary-container/20 bg-background px-6 py-3 shadow-[0px_10px_20px_rgba(90,96,90,0.05)]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search boutique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded-full border border-outline/15 bg-surface-container-low py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-secondary-container-dim/50 shadow-lg py-6 px-6 z-40 animate-fade-in animate-duration-200">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => {
              const navKey = `${item.label}-${item.href}`;
              const isActive = activeNavKey === navKey;

              return (
                <div key={`${item.label}-${item.href}`} className="border-b border-secondary-container/10 pb-2">
                  {item.items.length > 0 ? (
                    <div
                      className={`block text-base font-semibold py-2 transition-all ${
                        isActive
                          ? "text-primary border-l-4 border-primary pl-3 bg-primary/5"
                          : "text-secondary"
                      }`}
                    >
                      {item.label}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block text-base font-semibold py-2 transition-all ${
                        isActive
                          ? "text-primary border-l-4 border-primary pl-3 bg-primary/5"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                  {item.items.length > 0 && (
                    <div className="pl-4">
                      {item.items.map((child) => (
                        <Link
                          key={`${child.label}-${child.href}`}
                          href={child.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-1.5 text-sm font-semibold text-secondary/85 transition-colors hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
