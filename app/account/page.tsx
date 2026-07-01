"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  MapPin, 
  History, 
  Heart, 
  LogOut, 
  SlidersHorizontal, 
  ChevronDown, 
  Package, 
  Star, 
  Check, 
  Trash2, 
  Plus, 
  ExternalLink,
  Edit2,
  AlertCircle,
  Clock,
  ThumbsUp,
  X,
  Loader2
} from "lucide-react";
import FormNotice from "@/components/ui/FormNotice";
import { AuthUser, clearAuthSession, getCurrentUser, getSavedCustomerProfile, setCurrentUser } from "@/lib/auth";
import { getWishlist, setWishlist } from "@/lib/wishlist";
import { getDefaultVariant, hasVariantPriceRange } from "@/lib/pricing";
import { Product } from "@/types/shopify";

// Types
type TabType = "profile" | "addresses" | "orders" | "wishlist";
type OrderFilter = "6months" | "thisyear" | "all";
const phonePattern = /^[+()\-. \d]{7,}$/;

function hasCompleteCustomerProfile(user: AuthUser) {
  return Boolean(user.firstName.trim() && user.lastName.trim() && phonePattern.test((user.phone || "").trim()));
}

interface Address {
  id: string;
  name: string;
  street: string;
  building: string;
  apartment?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

const ADDRESS_STORAGE_KEY = "don_perro_addresses";

const emptyAddressForm: Omit<Address, "id"> = {
  name: "",
  street: "",
  building: "",
  apartment: "",
};

interface OrderDetails {
  payment: string;
  shippingAddress: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
}

interface Order {
  id: string;
  title: string;
  date: string;
  price: string;
  itemCount: number;
  status: string;
  imageUrl: string;
  badgeColor: string;
  fulfillmentStatus: string;
  financialStatus: string;
  isCancelled?: boolean;
  cancelReason?: string;
  details?: OrderDetails;
  lineItems?: OrderLineItem[];
}

interface OrderLineItem {
  title: string;
  quantity: number;
  merchandiseId: string;
  variantTitle: string;
  price: string;
  imageUrl: string;
}

interface ShopifyAccountOrder {
  id: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  totalPrice: string;
  itemCount: number;
  title: string;
  imageUrl: string;
  lineItems: OrderLineItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"checking" | "guest" | "authenticated">("checking");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("6months");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modals / Detail actions state
  const [viewingReason, setViewingReason] = useState<string | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>(emptyAddressForm);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = await response.json();
        const shopifyUser = payload.authenticated ? payload.user as AuthUser : null;
        const sessionUser = getCurrentUser();
        const savedProfile = shopifyUser ? getSavedCustomerProfile(shopifyUser.email) : null;
        const currentUser = shopifyUser
          ? {
              ...shopifyUser,
              firstName: shopifyUser.firstName || savedProfile?.firstName || "",
              lastName: shopifyUser.lastName || savedProfile?.lastName || "",
              phone: shopifyUser.phone || savedProfile?.phone || "",
            }
          : sessionUser;

        if (!currentUser) {
          setAuthStatus("guest");
          return;
        }

        setCurrentUser(currentUser);
        setAuthUser(currentUser);
        setFirstName(currentUser.firstName);
        setLastName(currentUser.lastName);
        setEmail(currentUser.email);
        setPhone(currentUser.phone || "");
        setRequiresProfileCompletion(!hasCompleteCustomerProfile(currentUser));
        setAuthStatus("authenticated");
        loadOrders();
      } catch (error) {
        console.error(error);
        const sessionUser = getCurrentUser();
        const savedProfile = sessionUser ? getSavedCustomerProfile(sessionUser.email) : null;
        const currentUser = sessionUser && savedProfile
          ? {
              ...sessionUser,
              firstName: sessionUser.firstName || savedProfile.firstName,
              lastName: sessionUser.lastName || savedProfile.lastName,
              phone: savedProfile.phone || sessionUser.phone || "",
            }
          : sessionUser;
        if (!currentUser) {
          setAuthStatus("guest");
          return;
        }

        setAuthUser(currentUser);
        setFirstName(currentUser.firstName);
        setLastName(currentUser.lastName);
        setEmail(currentUser.email);
        setPhone(currentUser.phone || "");
        setRequiresProfileCompletion(!hasCompleteCustomerProfile(currentUser));
        setAuthStatus("authenticated");
        loadOrders();
      }
    };

    loadCustomer();
  }, []);

  useEffect(() => {
    try {
      const storedAddresses = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (!storedAddresses) return;

      const parsed = JSON.parse(storedAddresses);
      setAddresses(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error("Failed to load saved addresses", error);
      setAddresses([]);
    }
  }, []);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  useEffect(() => {
    const syncWishlist = () => {
      setWishlistItems(getWishlist());
    };

    syncWishlist();
    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);

    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, []);

  // Order Details expanded state
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [hasLoadedOlderOrders, setHasLoadedOlderOrders] = useState(false);

  // Order data list representing Stitch screen
  const baseOrders: Order[] = [
    {
      id: "DP-92841",
      title: "Artisan Leather Collar & Lead Set",
      date: "Oct 12, 2023",
      price: "$89.00",
      itemCount: 1,
      status: "In Progress",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRpYchBjEfs_ivrd8Lga0LKuiFdXscx1QHTfCFvxqDXHWXg5ipaYzPwPWLs7HXblZQM0uqXb7R9vQH5Apkwq668_7CDkl3kQtZPT9cT2uxOMeLeUA9IaSSmR51gNmRnrw5ChPBEUND3Q-fvqSyElPkMf0NOsrbGSTUeYfxPCY7vM9ng-YkG6OjhvQVZAOer53ZG3JmVP7K_aEijv3v4mPdD8lICKnFedbJta70ky_Tx9m9aJV1kjGyrVTQoP4YM3z_c2CUvcK73U0S",
      badgeColor: "bg-tertiary-fixed text-on-tertiary-fixed",
      fulfillmentStatus: "IN_PROGRESS",
      financialStatus: "PAID",
      details: {
        payment: "Visa/ShopPay (ending in 4820)",
        shippingAddress: "1248 Sagamore Terrace, Suite B, Los Angeles, CA 90025",
        subtotal: "$79.00",
        shipping: "Free Premium Shipping",
        tax: "$10.00",
        total: "$89.00"
      }
    },
    {
      id: "DP-91022",
      title: "Gourmet Organic Treat Bundle",
      date: "Sept 28, 2023",
      price: "$45.50",
      itemCount: 3,
      status: "Delivered",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6dAvqTfDLclJJ95mAYCwFKyGAF3R6lytp-VJV9UckxghuKhPX9ESKI8SELn0ps1CFfKz3E-ZUBVA6fZ2z39anAtj6DsBNKv6GYBsFXD13Yz5TG81UzatTw2VQ-DU_UxQiRn4-g1AoQ36nmh3Fd9IRUN6mNed1xEfcJ-kR_j85CzZuJU7FWrXPqUJAa6NEluooR0hwaeeiJ2D4xXV_wxlCxjMs9m3qMQ3_r5IXvY9ScgSOh7uCygnnB52TOsOw9WbyjFssl7QR3q00",
      badgeColor: "bg-secondary-container text-on-secondary-container",
      fulfillmentStatus: "FULFILLED",
      financialStatus: "PAID",
      details: {
        payment: "Apple Pay (Mastercard ending in 0831)",
        shippingAddress: "1248 Sagamore Terrace, Suite B, Los Angeles, CA 90025",
        subtotal: "$39.00",
        shipping: "Standard - $6.50",
        tax: "$0.00",
        total: "$45.50"
      }
    },
    {
      id: "DP-88712",
      title: "Minimalist Ceramic Feeding Set",
      date: "Aug 15, 2023",
      price: "$120.00",
      itemCount: 2,
      status: "Cancelled",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDy5Hpv0BfZTfp7yPoOikhRwEsKOzpTKkulBIO4kk7OmlVQoUL4I1pp655rqXX5yAh-6DFLXySUy-rXLuZIOZ48ErzArMoS1xxTULuVp1NEt7UIS29lhlvprv1R8y806sBvu0NBToz1moGkJkciDXaN4eGNPGDTyXz0Cp9YFQ86_BXFs8lrRQNdkykyY95TrcTpw5Heb0gDksPFsg0l8gongYCfYzLM37-HjC5tZi1YVful4VbzcVE12QnMheq4tFXIaEEa9zS4JdhV",
      badgeColor: "bg-error-container text-on-error-container",
      fulfillmentStatus: "UNFULFILLED",
      financialStatus: "VOIDED",
      isCancelled: true,
      cancelReason: "Out of Stock: Our boutique organic clay supplier encountered transit blockages. Mateo initiated full immediate refund on Aug 16, 2023 to original payment card.",
      details: {
        payment: "Visa/ShopPay (ending in 4820)",
        shippingAddress: "1248 Sagamore Terrace, Los Angeles, CA 90025",
        subtotal: "$120.00",
        shipping: "Free",
        tax: "$0.00",
        total: "$120.00"
      }
    }
  ];

  const olderOrders: Order[] = [
    {
      id: "DP-81992",
      title: "Handmade Organic Cotton Hemp Toy Pack",
      date: "June 20, 2023",
      price: "$34.00",
      itemCount: 4,
      status: "Delivered",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB68KhJ8lC0lzLS0sNdRUj8XSDEjp1P9rO7j4c5hcseclRnp0sjo1fwx-jBpapCUPyORV6kl2GtkRMHaOGHKXuGXv2_yyYnrzYk4BVHk9uszNaZp25sCw5Hxs4JJvN6XLozmkjSDbKfZnhgkDSpN3gaJKmuTYWt3_G2I7H-bKPzgvBJyWfzzymtKwBOqSZ1MPuh_2-zz1L6lDCFS9YZO9tn4c5opN5Z9OHM7gz_FVQEHk8nCPV2v9O6H-LCshniswU8wEieY_xVCYA",
      badgeColor: "bg-secondary-container text-on-secondary-container",
      fulfillmentStatus: "FULFILLED",
      financialStatus: "PAID"
    },
    {
      id: "DP-79201",
      title: "Prime Organic Kibble Formula (Lamb & Sage)",
      date: "May 10, 2023",
      price: "$64.00",
      itemCount: 1,
      status: "Delivered",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBl1KRtcbuA_02p6ue-q34xXugmv6git9xVlHLkiVnp2QhdApzDm7fWbftV-t2AlwOm-Ot-ilUes7mAQa_nlhF83O3nQOr8nHrpExVmpvcnHWbzTGYPshDR0V3bvcTF-ZZ4aAezqEAqy-Vhko30W9BqGbV2mAp-Tf8uT_M-h91QiXIorEYLie-M8S1MilpIw2g1rxg5cAUNdIOZGL6rd1MTfsyxzN9KKXQcmjj-_8xFIzr1Q41MiCto6LmhghGdelsNE6094BZcQdI",
      badgeColor: "bg-secondary-container text-on-secondary-container",
      fulfillmentStatus: "FULFILLED",
      financialStatus: "PAID"
    }
  ];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await fetch("/api/account/orders", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load your orders.");
      }

      setOrders((payload.orders as ShopifyAccountOrder[]).map(mapShopifyOrder));
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Unable to load your orders.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return setProfileError("Please enter your first and last name.");
    if (!email.trim()) return setProfileError("Please enter your email address.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setProfileError("Please enter a valid email address.");
    if (!phonePattern.test(phone.trim())) return setProfileError("Please enter a valid phone number.");
    setProfileError(null);
    setProfileSaving(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update your profile.");
      }

      const updatedUser: AuthUser = {
        ...payload.user,
        phone: phone.trim(),
      };

      setCurrentUser(updatedUser);
      setAuthUser(updatedUser);
      setFirstName(updatedUser.firstName);
      setLastName(updatedUser.lastName);
      setEmail(updatedUser.email);
      setPhone(updatedUser.phone || "");
      if (requiresProfileCompletion) {
        setRequiresProfileCompletion(false);
        setActiveTab("orders");
      }
      showToast("Profile information updated successfully!");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to update your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    setAddresses(updated);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
    showToast("Saved address deleted.");
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.name.trim()) return setAddressError("Please enter an address nickname.");
    if (!newAddress.street.trim()) return setAddressError("Please enter the street.");
    if (!newAddress.building.trim()) return setAddressError("Please enter the building.");
    setAddressError(null);
    const newId = `addr_${Date.now()}`;
    const formattedAddress: Address = {
      id: newId,
      ...newAddress,
      name: newAddress.name.trim(),
      street: newAddress.street.trim(),
      building: newAddress.building.trim(),
      apartment: newAddress.apartment?.trim() || "",
    };

    const updatedAddresses = [...addresses, formattedAddress];

    setAddresses(updatedAddresses);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updatedAddresses));

    setIsAddingAddress(false);
    setNewAddress(emptyAddressForm);
    showToast("Premium address added successfully!");
  };

  const handleRemoveFromWishlist = (id: string) => {
    const updated = wishlistItems.filter(item => item.id !== id);
    if (setWishlist(updated)) {
      setWishlistItems(updated);
      showToast("Item removed from your boutique wishlist.");
    }
  };

  const handleWishlistAddToCart = (product: Product) => {
    const firstVariant = getDefaultVariant(product);
    const selectedVariantId = firstVariant?.id || `var_${product.id}_1`;
    const selectedVariantTitle = firstVariant?.title || "Standard";

    let currentCart: Array<{
      product: Product;
      quantity: number;
      selectedVariantId: string;
      selectedVariantTitle: string;
    }> = [];

    try {
      const savedCart = localStorage.getItem("don_perro_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        currentCart = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
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
        selectedVariantTitle,
      });
    }

    localStorage.setItem("don_perro_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
    showToast(`Added "${product.title}" to shopping cart!`);
  };

  const handleAddToCart = (productName: string, lineItems?: OrderLineItem[]) => {
    if (!lineItems?.length) {
      showToast(`Added "${productName}" to shopping cart!`);
      return;
    }

    const cartItems = lineItems.map((item) => ({
      product: {
        id: item.merchandiseId,
        title: item.title,
        handle: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description: "",
        vendor: "Don Perro",
        productType: "Reorder",
        tags: [],
        featuredImage: {
          url: item.imageUrl,
          altText: item.title,
        },
        images: [{
          url: item.imageUrl,
          altText: item.title,
        }],
        priceRange: {
          minVariantPrice: {
            amount: item.price.replace(/[^0-9.]/g, "") || "0",
            currencyCode: "USD",
          },
        },
        variants: [{
          id: item.merchandiseId,
          title: item.variantTitle,
          availableForSale: true,
          price: {
            amount: item.price.replace(/[^0-9.]/g, "") || "0",
            currencyCode: "USD",
          },
        }],
      },
      quantity: item.quantity,
      selectedVariantId: item.merchandiseId,
      selectedVariantTitle: item.variantTitle,
    }));

    localStorage.setItem("don_perro_cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cart-updated"));
    showToast(`Added ${lineItems.length} ${lineItems.length === 1 ? "item" : "items"} from "${productName}" to your cart.`);
    setTimeout(() => router.push("/cart"), 600);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return setReviewError("Please share a few words about your purchase before submitting.");
    setReviewError(null);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewingOrder(null);
      setReviewSubmitted(false);
      setReviewText("");
      showToast("Thank you! Your verified product review is being processed. Prime points gained! 🌟");
    }, 1500);
  };

  const mapShopifyOrder = (order: ShopifyAccountOrder): Order => {
    const status = formatOrderStatus(order.fulfillmentStatus, order.financialStatus);
    const lineItemCount = order.lineItems?.reduce((total, item) => total + item.quantity, 0) || 0;

    return {
      id: normalizeOrderNumber(order.id),
      title: order.title,
      date: formatOrderDate(order.processedAt),
      price: order.totalPrice,
      itemCount: order.itemCount || lineItemCount,
      status,
      imageUrl: order.imageUrl,
      badgeColor: getOrderBadgeColor(status),
      fulfillmentStatus: order.fulfillmentStatus,
      financialStatus: order.financialStatus,
      lineItems: order.lineItems,
    };
  };

  const normalizeOrderNumber = (orderId: string) => {
    return orderId.replace(/^#+/, "");
  };

  const displayOrderNumber = (orderId: string) => {
    return `#${normalizeOrderNumber(orderId)}`;
  };

  const formatOrderStatus = (fulfillmentStatus: string, financialStatus: string) => {
    const normalizedFulfillment = fulfillmentStatus.trim().toUpperCase();
    const normalizedFinancial = financialStatus.trim().toUpperCase();

    if (["FULFILLED", "DELIVERED"].includes(normalizedFulfillment)) return "Delivered";
    if (["IN_PROGRESS", "PARTIALLY_FULFILLED", "ON_HOLD", "SCHEDULED"].includes(normalizedFulfillment)) return "In Progress";
    if (["UNFULFILLED", "PENDING"].includes(normalizedFulfillment)) return "Processing";
    if (["REFUNDED", "PARTIALLY_REFUNDED", "VOIDED"].includes(normalizedFinancial)) return "Cancelled";
    if (normalizedFinancial === "PAID") return "Paid";

    return formatRawStatus(normalizedFulfillment || normalizedFinancial);
  };

  const getOrderBadgeColor = (status: string) => {
    if (status === "Delivered") return "bg-secondary-container text-on-secondary-container";
    if (status === "In Progress") return "bg-tertiary-fixed text-on-tertiary-fixed";
    if (status === "Cancelled") return "bg-error-container text-on-error-container";
    if (status === "Paid") return "bg-secondary-container text-on-secondary-container";
    return "bg-primary-container text-on-primary-container";
  };

  const formatRawStatus = (status: string) => {
    if (!status) return "Not available";

    return status
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatOrderDate = (date: string) => {
    if (!date) return "Recently";

    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return date;
    }
  };

  if (authStatus === "checking") {
    return (
      <main className="min-h-screen bg-background py-24 px-4">
        <div className="max-w-3xl mx-auto bg-white border border-outline-variant/60 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black font-heading text-on-surface">Checking your account</h1>
          <p className="text-sm text-secondary font-medium mt-2">Loading your Don Perro member details...</p>
        </div>
      </main>
    );
  }

  if (authStatus === "guest") {
    return (
      <main className="min-h-screen bg-background py-16 md:py-24 px-4 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
          <section className="bg-white border border-outline-variant/60 rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <User className="w-7 h-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary mb-3">Guest access</p>
            <h1 className="text-3xl md:text-4xl font-black font-heading text-on-surface tracking-tight">
              Sign in to manage your Don Perro account
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant font-medium leading-relaxed mt-4 max-w-xl">
              Your account keeps order history, saved addresses, wishlist picks, and profile preferences together for a faster boutique checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg hover:shadow-primary/20 transition-all"
              >
                Sign In
                <ExternalLink className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant bg-white px-6 py-3 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </section>

          <section className="grid gap-4">
            {[
              { icon: Package, title: "Track orders", copy: "See recent shipments, deliveries, cancellations, and payment details." },
              { icon: MapPin, title: "Save addresses", copy: "Keep home, office, and gift addresses ready for checkout." },
              { icon: Heart, title: "Keep your wishlist", copy: "Return to premium picks and add favorites to cart when ready." }
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.title} className="bg-white border border-outline-variant/60 rounded-2xl p-6 shadow-sm">
                  <IconComponent className="w-6 h-6 text-primary mb-4" />
                  <h2 className="text-lg font-black font-heading text-on-surface">{item.title}</h2>
                  <p className="text-sm text-secondary font-medium leading-relaxed mt-2">{item.copy}</p>
                </div>
              );
            })}
          </section>
        </div>
      </main>
    );
  }

  if (requiresProfileCompletion) {
    return (
      <main className="min-h-screen bg-background py-16 md:py-24 px-4 md:px-16">
        <section className="max-w-2xl mx-auto bg-white border border-outline-variant/60 rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <User className="w-7 h-7" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary mb-3">Complete your profile</p>
          <h1 className="text-3xl md:text-4xl font-black font-heading text-on-surface tracking-tight">
            Add your personal information
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-medium leading-relaxed mt-4">
            Please add your first name, last name, and phone number before continuing to your Don Perro account.
          </p>

          <form onSubmit={handleUpdateProfile} noValidate className="mt-8 space-y-4">
            <FormNotice message={profileError} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="required-first-name" className="text-xs font-bold text-secondary">First Name</label>
                <input
                  id="required-first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="required-last-name" className="text-xs font-bold text-secondary">Last Name</label>
                <input
                  id="required-last-name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="required-email" className="text-xs font-bold text-secondary">Email Address</label>
                <input
                  id="required-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-secondary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="required-phone" className="text-xs font-bold text-secondary">Phone Number</label>
                <input
                  id="required-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {profileSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Continue to Account"
              )}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 md:py-20 px-4 md:px-16 max-w-7xl mx-auto">
      
      {/* Dynamic persistent Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-outline-variant/10 max-w-md"
          >
            <Check className="w-5 h-5 text-primary-fixed stroke-[3]" />
            <p className="text-sm font-semibold font-sans leading-snug">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-6">
        
        {/* SIDEBAR NAVIGATION MODULE */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="mb-8">
            <h1 className="text-2xl font-black font-heading tracking-tight text-on-surface">My Account</h1>
            <p className="text-sm text-secondary font-medium mt-1">Welcome back, {authUser?.firstName || firstName}</p>
          </div>

          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-1.5 pb-4 md:pb-0 border-b border-outline-variant/20 md:border-b-0">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "addresses", label: "Address Management", icon: MapPin },
              { id: "orders", label: "Order History", icon: History },
              { id: "wishlist", label: "Wishlist", icon: Heart }
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all select-none cursor-pointer whitespace-nowrap outline-none ${
                    isActive
                      ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/10"
                      : "text-secondary hover:text-primary hover:bg-secondary-container/30 font-medium"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? "text-on-primary" : "text-secondaryGroup/70"}`} />
                  <span className="text-sm tracking-wide">{tab.label}</span>
                </button>
              );
            })}

            <div className="hidden md:block my-4 border-t border-outline-variant/30" />

            <button
              onClick={() => {
                clearAuthSession();
                showToast("Logging out from account...");
                setTimeout(() => {
                  window.location.href = "/api/auth/logout";
                }, 500);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error-container/20 font-bold transition-all w-full text-left cursor-pointer select-none outline-none mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm tracking-wide">Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* MAIN INTERACTIVE CONTENT BLOCK */}
        <section className="flex-grow min-w-0">
          <AnimatePresence mode="wait">
            
            {/* 1. ORDER HISTORY VIEW (MATCHES STITCH PAGE PERFECTLY) */}
            {activeTab === "orders" && (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant/20 pb-4">
                  <div>
                    <h2 className="text-3xl font-extrabold font-heading text-on-surface tracking-tight">Order History</h2>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">
                      Review and track your recent pet supply purchases.
                    </p>
                  </div>

                  {/* High fidelity status filter trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center gap-2.5 px-4.5 py-2.5 bg-white border border-outline-variant rounded-xl shadow-sm cursor-pointer select-none hover:bg-surface-container-low transition-colors outline-none"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Filter: {orderFilter === "6months" ? "Last 6 Months" : orderFilter === "thisyear" ? "This Year" : "All Orders"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-secondary transition-transform duration-200" />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-2xl shadow-xl z-30 overflow-hidden animate-fade-in">
                        {(["6months", "thisyear", "all"] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setOrderFilter(opt);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-surface-container-low cursor-pointer ${
                              orderFilter === opt ? "text-primary bg-primary/5" : "text-secondary"
                            }`}
                          >
                            {opt === "6months" ? "Last 6 Months" : opt === "thisyear" ? "This Year" : "All Orders"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cards List */}
                {ordersLoading ? (
                  <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center shadow-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-bold text-on-surface mt-4">Loading your Shopify orders...</p>
                    <p className="text-xs text-secondary font-medium mt-1">Fetching the latest order history for this customer account.</p>
                  </div>
                ) : ordersError ? (
                  <div className="bg-error-container/20 border border-error/15 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-black text-on-surface">Could not load orders</h3>
                        <p className="text-xs text-secondary font-medium leading-relaxed mt-1">{ordersError}</p>
                        <button
                          onClick={loadOrders}
                          className="mt-4 px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:shadow-md transition-all cursor-pointer"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-outline-variant/60 rounded-2xl p-8 text-center shadow-sm">
                    <Package className="w-9 h-9 text-primary mx-auto" />
                    <h3 className="text-xl font-black font-heading text-on-surface mt-4">No orders yet</h3>
                    <p className="text-sm text-secondary font-medium mt-2 max-w-md mx-auto">
                      Orders placed through this Shopify customer account will appear here after checkout.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-md"
                    >
                      Shop Now
                    </Link>
                  </div>
                ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isOrderCancelled = order.status === "Cancelled";
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div
                        key={order.id}
                        className={`bg-white border border-outline-variant/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0px_10px_30px_rgba(90,96,90,0.06)] transition-all duration-300 ${
                          isOrderCancelled ? "opacity-85 text-secondary/90 bg-surface-container-low/20" : ""
                        }`}
                      >
                        <div className="p-5 md:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex gap-4">
                              <div className={`w-16 h-16 rounded-xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex-shrink-0 ${isOrderCancelled ? "grayscale opacity-75" : ""}`}>
                                <img
                                  src={order.imageUrl}
                                  alt={order.title}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-sm tracking-wide text-primary">{displayOrderNumber(order.id)}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide select-none ${order.badgeColor}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <h3 className={`font-bold font-sans text-base text-on-surface line-clamp-1`}>
                                  {order.title}
                                </h3>
                                <p className="text-xs font-medium text-secondary">Ordered on {order.date}</p>
                              </div>
                            </div>

                            <div className="sm:text-right flex sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end">
                              <p className={`text-lg font-extrabold text-primary ${isOrderCancelled ? "line-through text-secondary" : ""}`}>
                                {order.price}
                              </p>
                              <p className="text-xs font-semibold text-secondary">{order.itemCount} {order.itemCount === 1 ? "Item" : "Items"}</p>
                            </div>
                          </div>

                          {/* Order actions row */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-outline-variant/20 items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/track-order?id=${encodeURIComponent(order.id)}`}
                                className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/10 hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer"
                              >
                                View Status
                              </Link>
                              <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="px-5 py-2 rounded-full border border-secondary text-secondary font-bold text-xs hover:bg-secondary-container/20 transition-all outline-none cursor-pointer"
                              >
                                Order Details
                              </button>

                              {order.status === "Delivered" && (
                                <>
                                  <button
                                    onClick={() => handleAddToCart(order.title, order.lineItems)}
                                    className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/10 hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer"
                                  >
                                    Buy It Again
                                  </button>
                                  <button
                                    onClick={() => setReviewingOrder(order.id)}
                                    className="px-5 py-2 rounded-full border border-secondary text-secondary font-bold text-xs hover:bg-secondary-container/20 transition-all outline-none cursor-pointer"
                                  >
                                    Leave a Review
                                  </button>
                                </>
                              )}

                              {order.status === "Cancelled" && (
                                <>
                                  <button
                                    onClick={() => setViewingReason(order.id)}
                                    className="px-5 py-2 rounded-full border border-secondary text-secondary font-bold text-xs hover:bg-secondary-container/20 transition-all outline-none cursor-pointer"
                                  >
                                    View Reason
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Accordion/Dropdown Expansion for Order Details */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-outline-variant/30 pt-4 mt-4 space-y-3 text-xs text-secondary overflow-hidden font-medium"
                            >
                              <div className="space-y-1 bg-surface-container-low/30 p-3 rounded-xl border border-outline-variant/10">
                                <p className="font-bold text-on-surface">Order Number</p>
                                <p>{displayOrderNumber(order.id)}</p>
                              </div>
                              <div className="bg-surface-container-low/20 p-4 rounded-xl border border-outline-variant/20">
                                <p className="font-bold text-on-surface mb-3">Order Items</p>
                                {order.lineItems?.length ? (
                                  <div className="max-h-[320px] divide-y divide-outline-variant/10 overflow-y-auto pr-1">
                                    {order.lineItems.map((item, index) => (
                                      <div
                                        key={`${item.merchandiseId}-${item.variantTitle}-${index}`}
                                        className={`flex gap-4 ${index > 0 ? "pt-4 mt-4" : ""}`}
                                      >
                                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-white md:h-20 md:w-20">
                                          <img
                                            src={item.imageUrl || "https://picsum.photos/seed/pet-order/200/200"}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={(event) => {
                                              event.currentTarget.src = "https://picsum.photos/seed/don-perro-order/200/200";
                                            }}
                                          />
                                          {item.quantity > 1 && (
                                            <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-black text-white shadow-sm">
                                              {item.quantity}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center">
                                          <div className="flex items-start justify-between gap-3">
                                            <div>
                                              <h4 className="line-clamp-1 text-sm font-bold text-on-surface">
                                                {item.title}
                                              </h4>
                                              {item.variantTitle && item.variantTitle !== "Default" && (
                                                <p className="mt-0.5 text-[11px] font-medium text-secondary/80">
                                                  <span className="font-bold">Size:</span> {item.variantTitle}
                                                </p>
                                              )}
                                              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary/65">
                                                Qty: {item.quantity}
                                              </p>
                                            </div>
                                            <p className="whitespace-nowrap text-xs font-bold text-primary">
                                              {item.price}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-dashed border-outline-variant/30 bg-white/60 p-4 text-center">
                                    <Package className="mx-auto mb-2 h-6 w-6 text-secondary/40" />
                                    <p>No item details were returned by Shopify for this order yet.</p>
                                  </div>
                                )}
                                <div className="mt-4 flex justify-between border-t border-outline-variant/30 pt-3 text-sm font-black text-on-surface">
                                  <span>Total</span>
                                  <span>{order.price}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}

                {/* Refresh Orders Link Button */}
                {orders.length > 0 && !ordersLoading && !ordersError && (
                <div className="pt-6 flex justify-center">
                  <button
                    onClick={loadOrders}
                    className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide cursor-pointer hover:underline decoration-2 underline-offset-4 outline-none select-none transition-transform active:scale-95"
                  >
                    <span>Refresh orders</span>
                    <ChevronDown className="w-4 h-4 text-primary -rotate-90" />
                  </button>
                </div>
                )}
              </motion.div>
            )}

            {/* 2. PROFILE SETTINGS VIEW */}
            {activeTab === "profile" && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-outline-variant/20 pb-4">
                  <h2 className="text-3xl font-extrabold font-heading text-on-surface tracking-tight">Profile Details</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">
                    Manage your personal details and security parameters.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} noValidate className="bg-white border border-outline-variant/60 rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-on-surface text-base">Personal Parameters</h3>
                  <FormNotice message={profileError} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-secondary">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-secondary">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-secondary">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        readOnly
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-secondary outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container cursor-pointer"
                    />
                    <label htmlFor="marketing" className="text-xs font-semibold text-secondary cursor-pointer select-none">
                      Send me exclusive invitations to upcoming artisanal pet drops and boutique newsletters.
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/10 hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {profileSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 3. ADDRESS MANAGEMENT VIEW */}
            {activeTab === "addresses" && (
              <motion.div
                key="addresses-tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                  <div>
                    <h2 className="text-3xl font-extrabold font-heading text-on-surface tracking-tight">Address Book</h2>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">
                      Manage verified shipment points for swift checkout.
                    </p>
                  </div>
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer select-none"
                    >
                      <Plus className="w-4 h-4" /> Add New
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isAddingAddress ? (
                    <motion.div
                      key="add-address-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white border border-outline-variant/80 rounded-2xl p-6"
                    >
                      <form onSubmit={handleCreateAddress} noValidate className="space-y-4">
                        <FormNotice message={addressError} />
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                          <h3 className="font-bold text-on-surface text-base">New Address</h3>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="text-secondary hover:text-on-surface p-1 rounded-full hover:bg-secondary-container/30 transition-colors cursor-pointer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-secondary">Address Nickname</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Home, Office"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-secondary">Street</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Main Street"
                              value={newAddress.street}
                              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-secondary">Building</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Building A"
                              value={newAddress.building}
                              onChange={(e) => setNewAddress({ ...newAddress, building: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-secondary">Apartment</label>
                            <input
                              type="text"
                              placeholder="e.g. 3B"
                              value={newAddress.apartment}
                              onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 text-sm font-medium text-on-surface focus:border-primary outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3">
                          <button
                            type="submit"
                            className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/10 hover:shadow-lg active:scale-95 transition-all outline-none cursor-pointer"
                          >
                            Add Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="px-6 py-3 rounded-full border border-secondary text-secondary font-bold text-xs hover:bg-secondary-container/20 transition-all outline-none cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="address-cards-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {addresses.length === 0 ? (
                        <div className="md:col-span-2 text-center bg-white border border-outline-variant/50 rounded-2xl py-12 px-4 space-y-3">
                          <MapPin className="w-10 h-10 text-secondary/40 mx-auto" />
                          <p className="text-sm font-bold text-on-surface font-sans">No saved addresses</p>
                          <p className="text-xs text-secondary leading-normal max-w-sm mx-auto">
                            Add a shipping address to keep it ready for future orders.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(true)}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:opacity-95 shadow-md active:scale-95 transition-all mt-2"
                          >
                            <Plus className="w-4 h-4" /> Add Address
                          </button>
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="bg-white border border-outline-variant/60 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-on-surface font-sans text-sm tracking-wide">
                                  {addr.name}
                                </h4>
                              </div>
                              <div className="text-xs text-secondary space-y-0.5 font-medium leading-relaxed">
                                <p>{addr.street || addr.addressLine1}</p>
                                <p>Building: {addr.building || addr.addressLine2 || "Not specified"}</p>
                                {(addr.apartment || addr.city || addr.state || addr.zip) && (
                                  <p>Apartment: {addr.apartment || [addr.city, addr.state, addr.zip].filter(Boolean).join(" ")}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/20 mt-4 text-xs font-bold text-secondary">
                              <button
                                onClick={() => showToast("Edit capability is active on Shopify integration rollout.")}
                                className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50" />
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="hover:text-error transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* 4. WISHLIST VIEW */}
            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist-tab"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-b border-outline-variant/20 pb-4">
                  <h2 className="text-3xl font-extrabold font-heading text-on-surface tracking-tight">Your Wishlist</h2>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">
                    Discerning items you've saved for future curated orders.
                  </p>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center bg-white border border-outline-variant/50 rounded-2xl py-12 px-4 space-y-3">
                    <Heart className="w-10 h-10 text-secondary/40 mx-auto" />
                    <p className="text-sm font-bold text-on-surface font-sans">No boutique items saved</p>
                    <p className="text-xs text-secondary leading-normal max-w-sm mx-auto">
                      Explore our handcrafted collections and save items with the heart icon to customize your curated registry.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex px-5 py-2 px-6 rounded-full bg-primary text-on-primary font-bold text-xs hover:opacity-95 shadow-md active:scale-95 transition-all mt-2"
                    >
                      Boutique Store
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => {
                      const pricePrefix = hasVariantPriceRange(item) ? "From " : "";
                      return (
                      <div
                        key={item.id}
                        className="bg-white border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                      >
                        <div className="relative aspect-square w-full font-sans bg-surface overflow-hidden">
                          <img
                            src={item.featuredImage.url}
                            alt={item.featuredImage.altText || item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="absolute top-3 right-3 p-2 bg-white/95 rounded-full hover:bg-error-container hover:text-on-error-container text-secondary transition-colors cursor-pointer shadow-sm"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-4 space-y-1 flex-grow flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                              {item.productType}
                            </span>
                            <h4 className="font-bold text-on-surface text-sm line-clamp-1 mt-0.5 leading-snug">
                              {item.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-4 border-t border-outline-variant/10">
                            <span className="font-extrabold text-primary text-sm leading-none">
                              {pricePrefix}${parseFloat(item.priceRange.minVariantPrice.amount).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleWishlistAddToCart(item)}
                              className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-bold text-[11px] hover:shadow transition-shadow cursor-pointer select-none leading-none flex items-center gap-1"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </div>
      {/* MODAL 1: CANCELLED REASON INFO MODAL */}
      <AnimatePresence>
        {viewingReason && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30"
            >
              <div className="bg-surface px-6 py-5 border-b border-outline-variant/30 flex justify-between items-center text-on-surface">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-error animate-pulse" />
                  <h3 className="text-base font-black font-heading">Cancel Reason</h3>
                </div>
                <button
                  onClick={() => setViewingReason(null)}
                  className="p-1 rounded-full text-secondary hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider font-sans leading-none">Cancelled Item</p>
                <p className="text-sm font-black text-on-surface leading-snug">Minimalist Ceramic Feeding Set (#DP-88712)</p>
                
                <div className="p-4 bg-error-container/20 border border-error/15 rounded-2xl text-xs text-secondary leading-relaxed font-medium">
                  {baseOrders[2].cancelReason}
                </div>

                <div className="space-y-1 text-on-surface-variant font-medium text-xs">
                  <p className="font-bold text-secondary text-xxs tracking-wider uppercase">Refund Information</p>
                  <p>Method: Visa card containing ending 4820</p>
                  <p>Date Initiated: Aug 16, 2023</p>
                  <p>Status: Completed (Credited back to account balance)</p>
                </div>
              </div>

              <div className="bg-surface px-6 py-4 border-t border-outline-variant/20 flex justify-end gap-2">
                <button
                  onClick={() => setViewingReason(null)}
                  className="px-5 py-2 rounded-full border border-secondary text-secondary font-bold text-xs hover:bg-secondary-container/20 transition-all cursor-pointer outline-none"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: LEAVE REVIEW DIALOG MODAL */}
      <AnimatePresence>
        {reviewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30"
            >
              <div className="bg-surface px-6 py-5 border-b border-outline-variant/30 flex justify-between items-center text-on-surface">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <h3 className="text-base font-black font-heading">Leave product review</h3>
                </div>
                <button
                  onClick={() => setReviewingOrder(null)}
                  className="p-1 rounded-full text-secondary hover:text-on-surface transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} noValidate>
                <div className="p-6 space-y-4">
                  <FormNotice message={reviewError} />
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider font-sans leading-none">Boutique Purchase</p>
                  <p className="text-sm font-black text-on-surface">Gourmet Organic Treat Bundle (#DP-91022)</p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary block leading-none">Select Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer hover:scale-110 transition-transform duration-150"
                        >
                          <Star className={`w-6.5 h-6.5 ${
                            star <= reviewRating ? "text-primary fill-primary" : "text-outline-variant/40"
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="review-desc" className="text-xs font-bold text-secondary">Your feedback</label>
                    <textarea
                      id="review-desc"
                      required
                      placeholder="Share your pet's delight! Are the ingredients fully digestive? Was the texture well received?"
                      rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-2xl py-3 px-4 text-xs font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    ></textarea>
                  </div>
                </div>

                <div className="bg-surface px-6 py-4 border-t border-outline-variant/20 flex justify-end gap-2 text-xs font-bold">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-primary text-on-primary hover:shadow-lg active:scale-95 transition-all cursor-pointer outline-none"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    className="px-5 py-2.5 rounded-full border border-secondary text-secondary hover:bg-secondary-container/20 transition-all cursor-pointer outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
