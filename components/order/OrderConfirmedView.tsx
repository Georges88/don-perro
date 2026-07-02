"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Undo, 
  Leaf,
  Calendar,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";
import { Product } from "@/types/shopify";
import FormNotice from "@/components/ui/FormNotice";
import { isDefaultVariantTitle } from "@/lib/pricing";

interface OrderItem {
  product: Product;
  quantity: number;
  selectedVariantId: string;
  selectedVariantTitle: string;
}

interface OrderData {
  orderId: string;
  shippingInfo: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
    apartment?: string;
  };
  paymentType: string;
  cardLast4: string;
  items: OrderItem[];
  subtotal: number;
  estimatedTax: number;
  total: number;
}

const CART_STORAGE_KEY = "don_perro_cart";
const PENDING_CHECKOUT_KEY = "don_perro_pending_checkout";

// Falling confetti particles logic
class ConfettiParticle {
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speed: number;
  rotationSpeed: number;
  opacity: number;

  constructor(canvasWidth: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * -300 - 50;
    this.rotation = Math.random() * 360;
    const colors = ["#6a5f00", "#d9c640", "#526161", "#b8c8c7", "#e1e3e3"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.size = Math.random() * 8 + 6;
    this.speed = Math.random() * 3 + 2;
    this.rotationSpeed = Math.random() * 4 - 2;
    this.opacity = 1;
  }

  update(canvasHeight: number, canvasWidth: number) {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
    if (this.y > canvasHeight) {
      this.y = -20;
      this.x = Math.random() * canvasWidth;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
    ctx.globalAlpha = 1.0;
  }
}

export default function OrderConfirmedView() {
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = newsletterEmail.trim();
    if (!normalizedEmail) return setNewsletterError("Please enter your email address.");
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setNewsletterError("Please enter a valid email address.");
    setNewsletterError(null);
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  // Load from local storage or fall back to high-fidelity mockup defaults
  useEffect(() => {
    setMounted(true);
    localStorage.setItem(CART_STORAGE_KEY, "[]");
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
    window.dispatchEvent(new Event("cart-updated"));

    try {
      const saved = localStorage.getItem("don_perro_last_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.orderId) {
          setOrder(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load last order from localStorage:", e);
    }

    // High-fidelity fallback that mirrors the Stitch mockup screen perfectly
    setOrder({
      orderId: "DP-98234",
      shippingInfo: {
        firstName: "Alex",
        lastName: "Hamilton",
        address: "123 Golden Paw Lane",
        city: "San Francisco",
        zipCode: "94103",
        apartment: "Apt 4B, Barkington Towers",
      },
      paymentType: "card",
      cardLast4: "4421",
      subtotal: 109.00,
      estimatedTax: 33.50,
      total: 142.50,
      items: [
        {
          product: {
            id: "prod_31",
            title: "Eco-Comfort Leather Harness",
            handle: "eco-comfort-leather-harness",
            description: "Premium handcrafted leather harness in Sage Green.",
            vendor: "Don Perro",
            productType: "Accessories",
            tags: ["accessories", "harness", "organic"],
            featuredImage: {
              url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCv7UYgLlqQA4k75rkYMgXvsQfbBgOY9iZrp06duR4lHS51AE9RVWyUHWnBmdLdyNtvM03KXfDm3pElnLhZRgD-c147fhQK1q02MrsEc8FwsF-Hygrof61AAju2nYZlveUlDxrN8Kqvefe58L05VD9J4LTV5I7vDilX3EoFBBUpdTlRByut_eSRYkDfePbF_ZQESdAIUCZErr2acq21GUvdZ2g7wYZlk7Suk6yDN51KcgRJDkGX64FVJtH7tfhyY2cvBMffb3MN_7Mz",
              altText: "Eco-Comfort Leather Harness in Sage Green"
            },
            images: [],
            priceRange: { minVariantPrice: { amount: "65.00", currencyCode: "USD" } },
            variants: [
              {
                id: "var_31_1",
                title: "Sage Green • Medium",
                availableForSale: true,
                price: { amount: "65.00", currencyCode: "USD" }
              }
            ]
          },
          quantity: 1,
          selectedVariantId: "var_31_1",
          selectedVariantTitle: "Size: Medium | Color: Sage Green"
        },
        {
          product: {
            id: "prod_32",
            title: "Artisanal Pumpkin Bites",
            handle: "artisanal-pumpkin-bites",
            description: "Luxury grain free treats made with pumpkin.",
            vendor: "Don Perro",
            productType: "Dog Food",
            tags: ["dog-food", "treats"],
            featuredImage: {
              url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfTVTRQFsLpUhOkzeZ326EpapMXS_IM6prr097CKnYM41I9RrhM-p7jPMtIq9aGXiRMc4EufL18ARyiPqr0zzum_F-F5cEB5iSqwEd3rbjkuvDoehFbA5ea-ff8RYU-PL48TYj3-r9iCWn5N7Wmm1njycDSCQrJM5c0KS4Dar6KLz5RBgBLOm-QtYNSr0zpitIQ8rVXiS3GOlwUv553CW4EUNep5IbG0GwqIFAM50nnclsN3jtkvP59X2709A91hGmTOHuNaB41vj8",
              altText: "Artisanal Pumpkin Bites"
            },
            images: [],
            priceRange: { minVariantPrice: { amount: "22.00", currencyCode: "USD" } },
            variants: [
              {
                id: "var_32_1",
                title: "Pack of 24 • Grain Free",
                availableForSale: true,
                price: { amount: "22.00", currencyCode: "USD" }
              }
            ]
          },
          quantity: 2,
          selectedVariantId: "var_32_1",
          selectedVariantTitle: "Pack of 24 | Grain Free"
        }
      ]
    });
  }, []);

  // Confetti Animation Controller
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push(new ConfettiParticle(width));
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Fade out particles slowly after 6 seconds to keep it high-end and clean
    let durationCounter = 0;
    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update(height, width);
        p.draw(ctx);
      });

      durationCounter++;
      // After 6 seconds (around 360 frames), gently fade out confetti
      if (durationCounter > 360) {
        particles.forEach((p) => {
          p.opacity = Math.max(0, p.opacity - 0.015);
        });
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  if (!mounted || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derive estimated delivery date: always output "Thursday, Oct 24" as mockup default if exact ID,
  // or a beautiful smart date (e.g., 3 business days from now) for dynamic checkouts!
  const deliveryDateString = order.orderId === "DP-98234" 
    ? "Thursday, Oct 24" 
    : (() => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      })();

  return (
    <div className="relative min-h-screen bg-background text-on-surface select-none overflow-x-hidden">
      
      {/* Dynamic Canvas Confetti */}
      <canvas 
        ref={canvasRef} 
        className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      />

      {/* Minimal Transactional Header */}
      <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md h-20 border-b border-secondary/10 flex items-center shadow-[0px_10px_30px_rgba(90,96,90,0.04)] px-5 focus-within:outline-none">
        <div className="w-full max-w-[1280px] mx-auto flex justify-between items-center px-4 md:px-8">
          <Link href="/" className="font-headline-md text-xl md:text-2xl font-bold text-primary tracking-tight uppercase hover:opacity-90 transition-opacity">
            Don Perro
          </Link>
          <a href="mailto:support@donperro.club" className="flex items-center gap-2 text-label-md font-semibold text-secondary hover:text-primary transition-colors">
            Support
            <HelpCircle className="w-4 h-4 text-secondary/70" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-12 pt-12 pb-24 font-sans">
        
        {/* Animated Confirmation Center Banner */}
        <section className="text-center max-w-4xl mx-auto mb-16 px-4">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#E2D24E]/20 text-primary rounded-full mb-6 shadow-md"
          >
            <CheckCircle2 className="w-10 h-10 md:w-14 md:h-14 stroke-[1.5] text-primaryFill" style={{ fill: "currentColor" }} />
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="font-headline-xl text-3xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="font-body-lg text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8"
          >
            High paws! Your order <span className="font-bold text-on-surface bg-[#E2D24E]/10 px-2.5 py-0.5 rounded-full border border-[#E2D24E]/30">{order.orderId}</span> has been placed successfully. We&apos;re getting it ready for your furry friend right now.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              href="/track-order?id=DP-8420"
              className="w-full sm:w-auto bg-primary text-white font-semibold py-4 px-10 rounded-full shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Truck className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Track Order
            </Link>
            <Link 
              href="/shop"
              className="w-full sm:w-auto border border-secondary text-secondary font-semibold py-4 px-10 rounded-full hover:bg-secondary-container hover:text-on-secondary-container transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </section>

        {/* Bento Grid Dynamic Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
          
          {/* Column Left: Shipping estimate visualizer */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 shadow-[0px_8px_30px_rgba(90,96,90,0.04)] border border-secondary/5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-headline-md text-xl md:text-2xl font-bold">Estimated Delivery</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-[155px] aspect-square relative rounded-xl overflow-hidden bg-surface-container shadow-sm border border-secondary/10 flex-shrink-0">
                  <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzyVAYFoVJDba7C4kP9wU46vsimAaF6UTEvmlsqJfNDcwGtA4PmzB-St-pEHB7Wjoe-D6BNaLU4sZI0aUBnDxNGJ0BjAocmgoz8S6IQEJ18j7YStAmyjq0PVElk0tcCyMWzIXQM5niOjQBtrVO4YluChE2lSlBJsDd8Gjt2seL1rvgCW1a1xREYmmdhO7-4lsznTl95rNi-u8i0Lf632sOXl3YAwk0PLFzNwPUE0MnQMja2GT9E9Fc2Dn2lTAJXSvm8sJJk6MeX3T2"
                    alt="Happy dog box delivery"
                    fill
                    sizes="155px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full">
                  <p className="font-headline-lg text-2xl md:text-3xl font-bold text-primary mb-1">
                    {deliveryDateString}
                  </p>
                  <p className="font-body-md text-secondary text-sm md:text-base">
                    Between 9:00 AM - 5:00 PM
                  </p>

                  {/* High-fidelity Delivery Tracker Steps */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 flex-shrink-0"></div>
                      <p className="font-body-md text-on-surface font-semibold text-sm md:text-base">Order Processing</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-40">
                      <div className="w-3 h-3 rounded-full bg-secondary flex-shrink-0"></div>
                      <p className="font-body-md text-secondary text-sm md:text-base">In Transit</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-40">
                      <div className="w-3 h-3 rounded-full bg-secondary flex-shrink-0"></div>
                      <p className="font-body-md text-secondary text-sm md:text-base">Out for Delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Billing & Shipping Address boxes */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Shipping Address Card */}
            <div className="bg-surface-container rounded-2xl p-6 border border-secondary/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <h3 className="font-label-md text-xs uppercase tracking-wider text-secondary">
                    Shipping Address
                  </h3>
                </div>
                <h4 className="font-headline-md text-lg md:text-xl font-bold text-on-surface">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </h4>
                <p className="font-body-md text-secondary text-sm md:text-base mt-2 leading-relaxed">
                  {order.shippingInfo.address}
                  {order.shippingInfo.apartment && <><br />{order.shippingInfo.apartment}</>}
                  <br />
                  {order.shippingInfo.city}, CA {order.shippingInfo.zipCode}
                </p>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-surface-container-high rounded-2xl p-6 border border-secondary/5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-secondary" />
                <h3 className="font-label-md text-xs uppercase tracking-wider text-secondary">
                  Payment Method
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-white p-1 rounded border border-secondary/10 flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-on-surface" />
                </div>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-sm md:text-base">
                    Visa ending in {order.cardLast4}
                  </p>
                  <p className="font-label-sm text-secondary text-xs mt-0.5">
                    Total Charged: ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Order Summary Cards Box */}
        <section className="bg-white rounded-2xl shadow-[0px_8px_30px_rgba(90,96,90,0.04)] border border-secondary/5 overflow-hidden mt-8">
          <div className="px-6 py-5 md:px-8 bg-surface-container-lowest border-b border-secondary/10 flex justify-between items-center">
            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-on-surface">Order Summary</h2>
            <span className="text-label-md text-sm text-secondary bg-surface-container px-3 py-1 rounded-full">{order.items.reduce((s,i)=>s+i.quantity, 0)} Items</span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Products List */}
            <div className="divide-y divide-secondary/10">
              {order.items.map((item, idx) => {
                const imgUrl = item.product.featuredImage?.url || "https://picsum.photos/seed/treats/200";
                const itemPrice = parseFloat(item.product.variants?.[0]?.price?.amount || item.product.priceRange?.minVariantPrice?.amount || "0");
                const lineTotal = itemPrice * item.quantity;

                return (
                  <div key={idx} className="flex justify-between items-start py-4 first:pt-0 last:pb-0 gap-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-background border border-secondary/10 flex-shrink-0">
                        <Image 
                          src={imgUrl}
                          alt={item.product.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-body-md font-bold text-sm md:text-base text-on-surface hover:text-primary transition-colors">
                          <Link href={`/products/${item.product.handle}`}>
                            {item.product.title}
                          </Link>
                        </h4>
                        {!isDefaultVariantTitle(item.selectedVariantTitle) && (
                          <p className="font-label-sm text-secondary text-xs mt-1">
                            <span className="font-bold">Size:</span> {item.selectedVariantTitle}
                          </p>
                        )}
                        <p className="font-label-sm text-secondary text-xs mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-body-md font-bold text-primary text-sm md:text-base flex-shrink-0">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Table details */}
            <div className="pt-6 border-t border-secondary/10 flex flex-col items-end gap-2.5">
              <div className="flex justify-between w-full max-w-sm text-sm">
                <span className="text-secondary">Subtotal</span>
                <span className="text-on-surface font-semibold">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-sm text-sm">
                <span className="text-secondary">Shipping</span>
                <span className="text-on-surface font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between w-full max-w-sm text-sm">
                <span className="text-secondary">Tax (CA 8.5%)</span>
                <span className="text-on-surface font-semibold">${order.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-sm mt-4 pt-4 border-t border-secondary/15">
                <span className="font-headline-md text-base md:text-lg font-bold text-on-surface">Total</span>
                <span className="font-headline-md text-base md:text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </section>

        {/* Brand Value Pillars Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-surface-container rounded-2xl border border-secondary/5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-secondary/10">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-label-md text-sm font-semibold mb-2">Buyer Protection</h4>
            <p className="text-label-sm text-xs text-secondary leading-relaxed max-w-xs">
              Your purchase is protected by our happiness guarantee.
            </p>
          </div>

          <div className="text-center p-6 bg-surface-container rounded-2xl border border-secondary/5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-secondary/10">
              <Undo className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-label-md text-sm font-semibold mb-2">Easy Returns</h4>
            <p className="text-label-sm text-xs text-secondary leading-relaxed max-w-xs">
              30-day window for returns if your pet isn&apos;t fully satisfied.
            </p>
          </div>

          <div className="text-center p-6 bg-surface-container rounded-2xl border border-secondary/5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-secondary/10">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-label-md text-sm font-semibold mb-2">Sustainably Made</h4>
            <p className="text-label-sm text-xs text-secondary leading-relaxed max-w-xs">
              Carbon neutral shipping for all our furry friends worldwide.
            </p>
          </div>
        </section>

      </main>

      {/* Footer minimal signature */}
      <footer className="bg-surface-container-lowest py-16 border-t border-secondary/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="font-headline-lg text-lg md:text-xl font-bold text-primary mb-4 uppercase">Don Perro</p>
            <p className="text-body-md text-xs md:text-sm text-secondary leading-relaxed">
              Curated essentials, boutique items, and luxury nutrition formulas for the modern dog and cat lover.
            </p>
          </div>
          <div>
            <h5 className="font-label-md text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">Shop Categories</h5>
            <ul className="space-y-2 text-xs md:text-sm text-secondary">
              <li><Link href="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link href="/shop?category=dog" className="hover:text-primary transition-colors">Dogs &amp; Pups</Link></li>
              <li><Link href="/shop?category=cat" className="hover:text-primary transition-colors">Cats &amp; Kittens</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">Company</h5>
            <ul className="space-y-2 text-xs md:text-sm text-secondary">
              <li><Link href="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-xs font-bold uppercase tracking-widest text-[#191c1c] mb-4">Newsletter Signup</h5>
            <p className="text-label-sm text-xs text-secondary mb-4 leading-relaxed">
              Join the pack for exclusive organic recipes and boutique launches.
            </p>
            <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-2">
              <FormNotice message={newsletterError} />
              {newsletterSubscribed ? (
                <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                  You&apos;re in the pack! Thank you for subscribing.
                </p>
              ) : (
              <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                required
                value={newsletterEmail}
                onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterError(null); }}
                className="bg-background border border-secondary/25 rounded-md p-2 flex-grow text-xs focus:border-primary focus:ring-0 focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-primary hover:opacity-90 text-white p-2.5 rounded-md flex items-center justify-center cursor-pointer transition-opacity"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              </div>
              )}
            </form>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-secondary/15 text-center">
          <p className="text-xs text-secondary">© {new Date().getFullYear()} Don Perro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
