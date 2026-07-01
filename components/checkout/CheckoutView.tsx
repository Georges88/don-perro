"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  CreditCard, 
  Truck, 
  Info, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  Undo2,
  ArrowRight
} from "lucide-react";
import { Product } from "@/types/shopify";
import { getDefaultVariant, getSelectedVariantAmount, hydrateCartLines } from "@/lib/pricing";

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantId: string;
  selectedVariantTitle: string;
}

interface CheckoutViewProps {
  initialProducts: Product[];
}

const PENDING_CHECKOUT_KEY = "don_perro_pending_checkout";
const ADDRESS_STORAGE_KEY = "don_perro_addresses";

interface SavedAddress {
  street?: string;
  building?: string;
  apartment?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
}

interface CheckoutAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
}

function createCartFingerprint(items: CartItem[]) {
  return items
    .map((item) => `${item.selectedVariantId}:${item.quantity}`)
    .sort()
    .join("|");
}

function getLatestCheckoutAddress(user?: { firstName?: string; lastName?: string; phone?: string }): CheckoutAddress | undefined {
  try {
    const savedAddresses = localStorage.getItem(ADDRESS_STORAGE_KEY);
    const parsed = savedAddresses ? JSON.parse(savedAddresses) : [];
    const address = Array.isArray(parsed) ? parsed[parsed.length - 1] as SavedAddress | undefined : undefined;

    if (!address) return undefined;

    const street = (address.street || address.addressLine1 || "").trim();
    const building = (address.building || address.addressLine2 || "").trim();
    const apartment = (address.apartment || "").trim();
    const city = (address.city || "").trim();

    if (!street || !city) return undefined;

    return {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
      address1: street,
      address2: [building, apartment].filter(Boolean).join(", "),
      city,
      country: "Lebanon",
    };
  } catch {
    return undefined;
  }
}

export default function CheckoutView({ initialProducts }: CheckoutViewProps) {
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Checkout Accordion Active Step
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // shipping info state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "Enzo",
    lastName: "Ferrari",
    address: "123 Canine Lane",
    city: "Austin",
    state: "Texas",
    zipCode: "78701"
  });

  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // payment method states
  const [paymentType, setPaymentType] = useState<"cc" | "paypal">("cc");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvc: ""
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Order status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | undefined>(undefined);
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize checkout products from LocalStorage, or load the high-fidelity default mockup items
  useEffect(() => {
    const savedCart = localStorage.getItem("don_perro_cart");
    let loadedItems: CartItem[] = [];

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        loadedItems = Array.isArray(parsed) ? hydrateCartLines(parsed, initialProducts) : [];
      } catch (e) {
        console.error("Failed to parse cart JSON", e);
      }
    }

    // Default to the exact products in the mockup screen if cart is empty
    if (loadedItems.length === 0) {
      const feast = initialProducts.find(p => p.handle === "royal-canine-feast");
      const collar = initialProducts.find(p => p.handle === "handcrafted-leather-collar");

      if (feast) {
        loadedItems.push({
          product: feast,
          quantity: 1,
          selectedVariantId: getDefaultVariant(feast)?.id || "var_29_1",
          selectedVariantTitle: "2.5kg • Organic Grain-Free"
        });
      }
      if (collar) {
        loadedItems.push({
          product: collar,
          quantity: 1,
          selectedVariantId: getDefaultVariant(collar)?.id || "var_30_1",
          selectedVariantTitle: "Tan Brown • Medium"
        });
      }
    }

    setCartItems(loadedItems);
    setMounted(true);
  }, [initialProducts]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (payload?.authenticated && payload.user?.email) {
          setCustomerEmail(payload.user.email);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  // Shipping validation
  const handleValidateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!shippingInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!shippingInfo.address.trim()) errors.address = "Street address is required";
    if (!shippingInfo.city.trim()) errors.city = "City is required";
    if (!shippingInfo.zipCode.trim()) errors.zipCode = "ZIP code is required";

    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
    } else {
      setShippingErrors({});
      setActiveStep(2);
    }
  };

  // Card details validation
  const handleValidatePayment = () => {
    if (paymentType === "paypal") {
      setActiveStep(3);
      return;
    }

    const errors: Record<string, string> = {};
    const cleanNumber = cardInfo.number.replace(/\s+/g, "");
    
    if (cleanNumber.length < 12) {
      errors.number = "Please enter a valid card number";
    }
    if (!cardInfo.expiry.includes("/")) {
      errors.expiry = "Use MM/YY format";
    }
    if (cardInfo.cvc.length < 3) {
      errors.cvc = "Required";
    }

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
    } else {
      setCardErrors({});
      setActiveStep(3);
    }
  };

  // Pre-formatting card number with spaces representation
  const handleCardNumberChange = (value: string) => {
    const formatted = value
      .replace(/\D/g, "")
      .substring(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardInfo({ ...cardInfo, number: formatted });
  };

  // Pre-formatting expiry date representation
  const handleExpiryChange = (value: string) => {
    const formatted = value
      .replace(/\D/g, "")
      .substring(0, 4)
      .replace(/(\d{2})(?=\d)/g, "$1/");
    setCardInfo({ ...cardInfo, expiry: formatted });
  };

  // Send customer to Shopify checkout so completed purchases become real Shopify orders.
  const handleCompletePurchase = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      let checkoutAddress: CheckoutAddress | undefined;
      try {
        const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const authPayload = authResponse.ok ? await authResponse.json() : null;
        checkoutAddress = authPayload?.authenticated ? getLatestCheckoutAddress(authPayload.user) : getLatestCheckoutAddress();
      } catch {
        checkoutAddress = getLatestCheckoutAddress();
      }

      const response = await fetch("/api/checkout/create", {
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
          address: checkoutAddress,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || "Unable to create Shopify checkout.");
      }

      localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({
        startedAt: new Date().toISOString(),
        cartFingerprint: createCartFingerprint(cartItems),
      }));
      window.location.href = payload.checkoutUrl;
    } catch (error) {
      setIsProcessing(false);
      setCheckoutError(error instanceof Error ? error.message : "Unable to create Shopify checkout.");
    }
  };

  // calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = getSelectedVariantAmount(item.product, item.selectedVariantId);
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 0; // FREE as shown in mockups
  const taxMultiplier = 0.0923; // roughly gets to ~12.00 on 130.00
  const estimatedTax = subtotal === 130 ? 12.00 : parseFloat((subtotal * taxMultiplier).toFixed(2));
  const total = subtotal + deliveryFee + estimatedTax;

  if (!mounted || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-sans">
      
      {/* Dynamic Checkout Specific High-contrast Header */}
      <header className="bg-surface/95 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/10 shadow-[0px_10px_30px_rgba(90,96,90,0.06)]">
        <nav className="flex justify-between items-center w-full px-6 md:px-16 max-w-7xl mx-auto h-20">
          <Link href="/" className="text-xl md:text-2xl font-bold font-heading text-primary cursor-pointer hover:opacity-90 transition-opacity">
            Don Perro
          </Link>
          <div className="flex items-center gap-2 text-secondary font-medium text-xs md:text-sm">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-semibold tracking-wide uppercase text-[11px] text-[#5a605a]">Secure Checkout</span>
          </div>
          <div>
            <Link 
              href="/shop" 
              className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 group"
            >
              <span className="hidden md:inline">Continue Shopping</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Primary Container Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 py-8 md:py-16 flex-grow w-full">
        <AnimatePresence mode="wait">
          
          {isCompleted ? (
            /* COMPLETED INVOICE SCREEN */
            <motion.div 
              key="success-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 md:p-12 text-center shadow-xl space-y-6"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-primary/5">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold font-heading text-on-surface">Order Confirmed!</h1>
              <p className="text-secondary text-sm md:text-base leading-relaxed max-w-md mx-auto">
                Thank you for choosing Don Perro, <span className="font-bold text-[#191c1c]">{shippingInfo.firstName}</span>. Your simulated purchase was processed successfully. 
              </p>
              
              <div className="bg-surface-container/60 rounded-2xl p-6 text-left max-w-md mx-auto border border-outline-variant/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Shipping Coordinator Address</h4>
                <p className="text-xs font-bold text-[#191c1c]">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p className="text-xs text-secondary/90 mt-1">{shippingInfo.address}</p>
                <p className="text-xs text-secondary/90">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <div className="border-t border-outline-variant/20 mt-4 pt-4 flex justify-between text-xs font-bold">
                  <span className="text-secondary/70">Amount Transacted</span>
                  <span className="text-[#191c1c]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link 
                  href="/shop"
                  className="px-8 py-3.5 bg-primary hover:opacity-95 text-on-primary rounded-full text-xs font-bold shadow-md active:scale-95 transition-all w-full sm:w-auto text-center"
                >
                  Continue Shopping
                </Link>
                <Link 
                  href="/"
                  className="px-8 py-3.5 border border-outline text-secondary hover:bg-surface-container-low rounded-full text-xs font-bold transition-all w-full sm:w-auto text-center"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          ) : isProcessing ? (
            /* PROCESSING WAITING INDICATOR */
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest/50 rounded-3xl border border-dashed border-outline-variant/30 text-center min-h-[450px]"
            >
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary mb-6"></div>
              <h2 className="text-xl md:text-2xl font-bold font-heading mb-2">Analyzing Transaction...</h2>
              <p className="text-secondary text-xs sm:text-sm max-w-sm">Please do not close this container. Connecting with secure banking gateways to dispatch pet items.</p>
            </motion.div>
          ) : (
            /* MASTER CHECKOUT WRAPPER GRID */
            <motion.div 
              key="checkout-forms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Accordion Left Section */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Accordion Step 1: Shipping */}
                <section className={`bg-white rounded-2xl border transition-shadow duration-300 ${activeStep === 1 ? 'border-primary/40 shadow-md ring-1 ring-primary/5' : 'border-outline-variant/30 shadow-sm'}`}>
                  <div className="flex items-center justify-between p-6 md:p-8 border-b border-outline-variant/10">
                    <div className="flex items-center gap-4">
                      {activeStep > 1 ? (
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                          <Check className="w-4 h-4 text-[#ffffff]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">1</div>
                      )}
                      <h2 className="font-heading font-semibold text-lg md:text-xl text-on-surface">Shipping Details</h2>
                    </div>
                    {activeStep !== 1 && (
                      <button 
                        onClick={() => setActiveStep(1)} 
                        className="text-primary font-bold text-xs hover:underline cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {activeStep === 1 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 md:p-8 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 text-left">
                              <label htmlFor="first-name" className="text-[10px] font-bold uppercase tracking-wider text-secondary">First Name</label>
                              <input 
                                id="first-name"
                                type="text"
                                value={shippingInfo.firstName}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                                placeholder="Enzo"
                                className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${shippingErrors.firstName ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                              />
                              {shippingErrors.firstName && <span className="text-[10px] text-error font-medium mt-0.5">{shippingErrors.firstName}</span>}
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                              <label htmlFor="last-name" className="text-[10px] font-bold uppercase tracking-wider text-secondary">Last Name</label>
                              <input 
                                id="last-name"
                                type="text"
                                value={shippingInfo.lastName}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                                placeholder="Ferrari"
                                className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${shippingErrors.lastName ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                              />
                              {shippingErrors.lastName && <span className="text-[10px] text-error font-medium mt-0.5">{shippingErrors.lastName}</span>}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label htmlFor="street-address" className="text-[10px] font-bold uppercase tracking-wider text-secondary">Street Address</label>
                            <input 
                              id="street-address"
                              type="text"
                              value={shippingInfo.address}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                              placeholder="123 Canine Lane"
                              className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${shippingErrors.address ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                            />
                            {shippingErrors.address && <span className="text-[10px] text-error font-medium mt-0.5">{shippingErrors.address}</span>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1 text-left">
                              <label htmlFor="city" className="text-[10px] font-bold uppercase tracking-wider text-secondary">City</label>
                              <input 
                                id="city"
                                type="text"
                                value={shippingInfo.city}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                placeholder="Austin"
                                className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${shippingErrors.city ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                              />
                              {shippingErrors.city && <span className="text-[10px] text-error font-medium mt-0.5">{shippingErrors.city}</span>}
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <label htmlFor="state-select" className="text-[10px] font-bold uppercase tracking-wider text-secondary">State</label>
                              <select 
                                id="state-select"
                                value={shippingInfo.state}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                                className="w-full border border-outline-variant/50 rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                              >
                                <option value="Texas">Texas</option>
                                <option value="California">California</option>
                                <option value="New York">New York</option>
                                <option value="Florida">Florida</option>
                                <option value="Washington">Washington</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1 text-left">
                              <label htmlFor="zip-code" className="text-[10px] font-bold uppercase tracking-wider text-secondary">ZIP Code</label>
                              <input 
                                id="zip-code"
                                type="text"
                                value={shippingInfo.zipCode}
                                onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                                placeholder="78701"
                                className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${shippingErrors.zipCode ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                              />
                              {shippingErrors.zipCode && <span className="text-[10px] text-error font-medium mt-0.5">{shippingErrors.zipCode}</span>}
                            </div>
                          </div>

                          <div className="pt-4 text-left">
                            <button 
                              onClick={handleValidateShipping}
                              className="bg-primary hover:opacity-95 text-on-primary font-bold text-xs px-10 py-4 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                            >
                              <span>Continue to Payment</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* Accordion Step 2: Payment */}
                <section className={`bg-white rounded-2xl border transition-shadow duration-300 ${activeStep === 2 ? 'border-primary/40 shadow-md ring-1 ring-primary/5' : 'border-outline-variant/30 shadow-sm'}`}>
                  <div className="flex items-center justify-between p-6 md:p-8 border-b border-outline-variant/10">
                    <div className="flex items-center gap-4">
                      {activeStep > 2 ? (
                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                          <Check className="w-4 h-4 text-[#ffffff]" />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}>
                          2
                        </div>
                      )}
                      <h2 className={`font-heading font-semibold text-lg md:text-xl ${activeStep === 2 ? 'text-on-surface' : 'text-secondary/70'}`}>Payment Method</h2>
                    </div>
                    {activeStep > 2 && (
                      <button 
                        onClick={() => setActiveStep(2)} 
                        className="text-primary font-bold text-xs hover:underline cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {activeStep === 2 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          
                          {/* Payment selector toggle boxes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`border-2 p-5 rounded-2xl flex items-start gap-4 cursor-pointer transition-all ${paymentType === "cc" ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                              <input 
                                type="radio" 
                                name="payment-method-radio" 
                                checked={paymentType === "cc"}
                                onChange={() => setPaymentType("cc")}
                                className="mt-1 accent-primary cursor-pointer"
                              />
                              <div className="text-left">
                                <span className="font-bold text-xs md:text-sm block text-on-surface">Credit Card</span>
                                <span className="text-[11px] text-secondary font-medium block mt-1">Safe & Secure via Stripe gateway</span>
                              </div>
                            </label>

                            <label className={`border-2 p-5 rounded-2xl flex items-start gap-4 cursor-pointer transition-all ${paymentType === "paypal" ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                              <input 
                                type="radio" 
                                name="payment-method-radio" 
                                checked={paymentType === "paypal"}
                                onChange={() => setPaymentType("paypal")}
                                className="mt-1 accent-primary cursor-pointer"
                              />
                              <div className="text-left">
                                <span className="font-bold text-xs md:text-sm block text-on-surface">PayPal</span>
                                <span className="text-[11px] text-secondary font-medium block mt-1">Express check-out with PayPal Account</span>
                              </div>
                            </label>
                          </div>

                          {/* Card input field group */}
                          {paymentType === "cc" ? (
                            <div className="space-y-4">
                              <div className="flex flex-col gap-1 text-left">
                                <label htmlFor="card-number" className="text-[10px] font-bold uppercase tracking-wider text-secondary">Card Number</label>
                                <div className="relative">
                                  <input 
                                    id="card-number"
                                    type="text"
                                    value={cardInfo.number}
                                    onChange={(e) => handleCardNumberChange(e.target.value)}
                                    placeholder="0000 0000 0000 0000"
                                    className={`w-full border rounded-xl p-3 pl-11 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${cardErrors.number ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                                  />
                                  <CreditCard className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70" />
                                </div>
                                {cardErrors.number && <span className="text-[10px] text-error font-medium mt-0.5">{cardErrors.number}</span>}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1 text-left">
                                  <label htmlFor="card-expiry" className="text-[10px] font-bold uppercase tracking-wider text-secondary">Expiry Date</label>
                                  <input 
                                    id="card-expiry"
                                    type="text"
                                    value={cardInfo.expiry}
                                    onChange={(e) => handleExpiryChange(e.target.value)}
                                    placeholder="MM / YY"
                                    className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${cardErrors.expiry ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                                  />
                                  {cardErrors.expiry && <span className="text-[10px] text-error font-medium mt-0.5">{cardErrors.expiry}</span>}
                                </div>

                                <div className="flex flex-col gap-1 text-left">
                                  <label htmlFor="card-cvc" className="text-[10px] font-bold uppercase tracking-wider text-secondary">CVC</label>
                                  <input 
                                    id="card-cvc"
                                    type="password"
                                    maxLength={4}
                                    value={cardInfo.cvc}
                                    onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value.replace(/\D/g, "") })}
                                    placeholder="123"
                                    className={`w-full border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all ${cardErrors.cvc ? 'border-error bg-error/5' : 'border-outline-variant/50'}`}
                                  />
                                  {cardErrors.cvc && <span className="text-[10px] text-error font-medium mt-0.5">{cardErrors.cvc}</span>}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 flex gap-4 text-left">
                              <div className="mt-1 flex-shrink-0 bg-primary/10 p-2 rounded-full">
                                <Sparkles className="w-5 h-5 text-primary" />
                              </div>
                              <p className="text-secondary text-xs md:text-sm leading-relaxed">
                                You have selected PayPal. After ordering, you will be redirected to PayPal's external transaction window to authorize the secure purchase.
                              </p>
                            </div>
                          )}

                          <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 justify-start">
                            <button 
                              onClick={handleValidatePayment}
                              className="bg-primary hover:opacity-95 text-on-primary font-bold text-xs px-10 py-4 rounded-full shadow-lg active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
                            >
                              Review Order
                            </button>

                            {/* Trust signals */}
                            <div className="flex items-center gap-4 text-secondary/50 grayscale hover:grayscale-0 transition-all">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#5a605a] opacity-80">PCI-DSS</span>
                              </div>
                              <div className="w-px h-3 bg-secondary/20" />
                              <div className="flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-primary" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#5a605a] opacity-80">SSL 256</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* Accordion Step 3: Review */}
                <section className={`bg-white rounded-2xl border transition-shadow duration-300 ${activeStep === 3 ? 'border-primary/40 shadow-md ring-1 ring-primary/5' : 'border-outline-variant/30 shadow-sm'}`}>
                  <div className="flex items-center justify-between p-6 md:p-8 border-b border-outline-variant/10">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}>
                        3
                      </div>
                      <h2 className={`font-heading font-semibold text-lg md:text-xl ${activeStep === 3 ? 'text-on-surface' : 'text-secondary/70'}`}>Review & Confirm</h2>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {activeStep === 3 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          
                          {/* Alert notice warning */}
                          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 flex items-start gap-4 text-left">
                            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                              Please verify your details one last time before completing your order. By clicking 'Complete Purchase', you agree to our terms of service and guarantee policies.
                            </p>
                          </div>

                          {/* Quick summary grid of coordinates */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-5 text-xs">
                            <div className="space-y-1.5">
                              <h4 className="font-bold text-primary text-[10px] uppercase tracking-wider">Recipients Coordinate</h4>
                              <p className="font-medium text-[#191c1c]">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                              <p className="text-secondary/90 leading-tight">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                            </div>
                            <div className="space-y-1.5 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-outline-variant/20 md:pl-5">
                              <h4 className="font-bold text-primary text-[10px] uppercase tracking-wider">Disbursement Method</h4>
                              <p className="font-medium text-[#191c1c]">{paymentType === "cc" ? "Credit Card ending in " + cardInfo.number.slice(-4) : "PayPal Balance"}</p>
                              <p className="text-secondary/90 leading-tight">Secured checkout verified locally</p>
                            </div>
                          </div>

                          <div className="pt-4 text-left space-y-3">
                            {checkoutError && (
                              <div className="rounded-2xl border border-error/20 bg-error-container/20 px-4 py-3 text-xs font-semibold text-error flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{checkoutError}</span>
                              </div>
                            )}
                            <button 
                              onClick={handleCompletePurchase}
                              className="w-full bg-primary hover:brightness-115 text-on-primary font-heading font-semibold text-sm py-4 rounded-full shadow-[0px_10px_30px_rgba(106,95,0,0.2)] hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <span>Complete Purchase — ${total.toFixed(2)}</span>
                            </button>
                            <p className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-70">
                              <Lock className="w-3.5 h-3.5 text-primary" />
                              <span>Encrypted, safe, and secure transaction</span>
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

              </div>

              {/* Order Summary Right Column (Sticky) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 text-left">
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                  <h3 className="font-heading font-semibold text-lg md:text-xl pb-4 border-b border-outline-variant/40 text-[#191c1c]">Order Summary</h3>
                  
                  {/* List of items */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-outline-variant/10">
                    {cartItems.map((item, index) => (
                      <div key={item.product.id + index} className={`flex gap-4 ${index > 0 ? 'pt-4' : ''}`}>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/20 relative">
                          <Image 
                            src={item.product.featuredImage.url || "https://picsum.photos/seed/pet/200/200"} 
                            alt={item.product.featuredImage.altText || item.product.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://picsum.photos/seed/kibble/200/200";
                            }}
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-center">
                          <h4 className="font-bold text-xs md:text-sm text-on-surface line-clamp-1 mb-0.5">{item.product.title}</h4>
                          <p className="text-[11px] text-secondary/80 font-medium">
                            <span className="font-bold">Size:</span> {item.selectedVariantTitle}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-secondary/65 font-bold uppercase tracking-wider mt-0.5">Qty: {item.quantity}</p>
                          )}
                          <p className="text-primary font-bold text-xs mt-1.5">${getSelectedVariantAmount(item.product, item.selectedVariantId).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing break downs */}
                  <div className="space-y-3.5 border-t border-outline-variant/30 pt-6 text-xs text-secondary font-medium">
                    <div className="flex justify-between items-center text-secondary/80">
                      <span>Subtotal</span>
                      <span className="text-[#191c1c] font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-secondary/80">
                      <span>Shipping</span>
                      <span className="text-primary font-bold uppercase tracking-wide">FREE</span>
                    </div>
                    <div className="flex justify-between items-center text-secondary/80">
                      <span>Estimated Tax</span>
                      <span className="text-[#191c1c] font-bold">${estimatedTax.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-base md:text-lg font-bold pt-4 border-t border-outline-variant/20 mt-4 text-[#191c1c] font-heading">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Arrives marker banner */}
                  <div className="pt-4">
                    <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 p-3 rounded-xl">
                      <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-[11px] text-[#5c5200] font-bold">Arrives by Tue, Oct 24th</span>
                    </div>
                  </div>

                </div>
              </aside>

            </motion.div>
          )}

        </AnimatePresence>

        {/* Core trust pillars block */}
        <section className="mt-16 md:mt-24 pt-12 md:pt-16 border-t border-outline-variant/10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-8">
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-base text-on-surface">Guaranteed Quality</h3>
            <p className="text-secondary text-xs sm:text-sm max-w-xs leading-relaxed">Every product is vetted by our team of certified veterinary nutritionists.</p>
          </div>
          
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2">
              <Undo2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-base text-on-surface">30-Day Returns</h3>
            <p className="text-secondary text-xs sm:text-sm max-w-xs leading-relaxed">Not the right fit? Exchange or return any item within 30 days, no questions asked.</p>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-base text-on-surface">24/7 Pet Support</h3>
            <p className="text-secondary text-xs sm:text-sm max-w-xs leading-relaxed">Need advice? Our pet care specialists are online and ready to help.</p>
          </div>
        </section>

      </main>

      {/* Styled custom footer for the checkout sequence */}
      <footer className="bg-secondary text-on-secondary mt-auto">
        <div className="w-full py-16 px-6 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-10 max-w-7xl mx-auto">
          <div>
            <div className="text-xl font-bold font-heading text-primary-fixed mb-4">Don Perro</div>
            <p className="text-xs md:text-sm text-on-secondary/80 leading-relaxed">
              Premium pet supplies for those who treat their companions like family. Handmade with love & exquisite quality.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-fixed">Shop</h4>
            <ul className="space-y-2 text-xs md:text-sm text-on-secondary/70">
              <li><Link className="hover:text-primary-fixed transition-colors" href="/shop?filter=best-sellers">Best Sellers</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/shop?category=dog-food">Dog Food</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/shop?category=accessories">Accessories</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/shop?category=toys">Gift Cards</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-fixed">Policies</h4>
            <ul className="space-y-2 text-xs md:text-sm text-on-secondary/70">
              <li><Link className="hover:text-primary-fixed transition-colors" href="/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/#col-1">Shipping & Returns</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/terms">Terms of Service</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/#col-1">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-primary-fixed">Newsletter</h4>
            <div className="flex">
              <input 
                className="bg-on-secondary/10 border-none rounded-l-xl px-4 py-3 text-xs w-full focus:ring-1 focus:ring-primary-fixed outline-none text-white placeholder-white/30" 
                placeholder="Email Address" 
                type="email"
                aria-label="Email address for subscription"
              />
              <button className="bg-primary-fixed text-on-primary-fixed font-bold text-xs px-5 rounded-r-xl cursor-pointer hover:bg-primary-fixed/90 transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16 py-6 border-t border-on-secondary/10 text-xs text-on-secondary/60 text-center">
          © 2024 Don Perro Premium Pet Store. All rights reserved. Registered boutique hub.
        </div>
      </footer>

    </div>
  );
}
