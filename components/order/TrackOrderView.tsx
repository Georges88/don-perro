"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MapPin, 
  CreditCard, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Clock, 
  AlertCircle,
  Package,
  Calendar,
  ChevronRight,
  Sparkles,
  PhoneCall,
  User,
  ExternalLink
} from "lucide-react";
import { getWishlist } from "@/lib/wishlist";

interface TrackingStep {
  title: string;
  date: string;
  done: boolean;
}

interface OrderItem {
  title: string;
  variant: string;
  quantity: number;
  price: string;
  imageUrl: string;
}

interface MockOrder {
  id: string;
  email: string;
  status: string;
  orderDate: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  lastUpdate: string;
  location: string;
  steps: TrackingStep[];
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  payment: {
    subtotal: string;
    shippingFee: string;
    tax: string;
    total: string;
    method: string;
  };
}

// Full dataset of trackable orders matching the system
const MOCK_ORDERS: Record<string, MockOrder> = {
  "DP-8420": {
    id: "DP-8420",
    email: "customer@donperro.CLUB", // Case insensitive match handling
    status: "Shipped",
    orderDate: "Oct 24, 2024",
    estimatedDelivery: "Oct 28, 2024",
    carrier: "FedEx",
    trackingNumber: "DP987654321",
    lastUpdate: "Oct 25, 2024 - 10:30 AM",
    location: "Distribution Center, NY",
    steps: [
      { title: "Order Placed", date: "Oct 24, 2024", done: true },
      { title: "Processing", date: "Oct 24, 2024", done: true },
      { title: "Shipped", date: "Oct 25, 2024", done: true },
      { title: "Out for Delivery", date: "Expected Oct 28, 2024", done: false },
      { title: "Delivered", date: "Expected Oct 28, 2024", done: false }
    ],
    items: [
      {
        title: "Wilderness Peak Organic Kibble",
        variant: "12kg Bag",
        quantity: 1,
        price: "$45.00",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD41skOGuRpfXT3I9GNbK4i0wc4dOmHOprkKGerkuJ1gQlhElOG7NCizhhZ0fpiYVnlJ0dumZlur24T23lQN_sD-QygjhVCL1G-FEnyHnnUo5QJy9qF8L8_TuaTE_qiQkY4YMg9jUBoZL47uaIb7K73XAQnWvA_hDv3fvleXnFyCA3uqs1I38Tbjlt5ro7g-Ir3Ebbq7Ye09XEWgRaDN4RcYANasBc3zxtgzKrvULWm9Gp9n4X_foUCqcMw8zWgbLf2XSwvTIDlobWc"
      },
      {
        title: "Everlast Leather Collar",
        variant: "Large - Olive Green",
        quantity: 1,
        price: "$28.00",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnuBb1_Lpi2-mSNrO8sMooZnzpIPwEgWbhDjr3yToat9daHA6KQfdT4h5v0HtiTPa2OVHeM0JLmQk9LfMkcPAuV-VGpI38reua9rZJrKVgVVTE-74Oxelri-9lmmDrWIz4tAeonX1g9c9ZZBxeYXu2t_AxFfEfEQXIBm8uTCa3SeSoEqkXa9rtnmWjiaHr8nluJLhwxrRB9d9CM1tls-UMwnU8JO-BfMagSCUBNiFh5nHfjAQStZ7GfWw5H58bDQoKihR1t7ajpJ4S"
      }
    ],
    shippingAddress: {
      fullName: "Sarah Jenkins",
      street: "123 Pet Lane, Boutique Square",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210"
    },
    payment: {
      subtotal: "$73.00",
      shippingFee: "$5.00",
      tax: "$6.20",
      total: "$84.20",
      method: "Visa ending in 4820"
    }
  },
  "DP-92841": {
    id: "DP-92841",
    email: "customer@donperro.CLUB",
    status: "Shipped",
    orderDate: "Oct 12, 2023",
    estimatedDelivery: "Oct 15, 2023",
    carrier: "DHL Express",
    trackingNumber: "DP-DHL-71829",
    lastUpdate: "Oct 13, 2023 - 10:20 AM",
    location: "Oakland Sorting Facility, CA",
    steps: [
      { title: "Order Placed", date: "Oct 12, 2023", done: true },
      { title: "Processing & Packaging", date: "Oct 12, 2023", done: true },
      { title: "Shipped & In Transit", date: "Oct 13, 2023", done: true },
      { title: "Out for Delivery", date: "Expected Oct 15, 2023", done: false },
      { title: "Delivered", date: "Expected Oct 15, 2023", done: false }
    ],
    items: [
      {
        title: "Artisan Leather Collar & Lead Set",
        variant: "Standard - Cognac",
        quantity: 1,
        price: "$89.00",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRpYchBjEfs_ivrd8Lga0LKuiFdXscx1QHTfCFvxqDXHWXg5ipaYzPwPWLs7HXblZQM0uqXb7R9vQH5Apkwq668_7CDkl3kQtZPT9cT2uxOMeLeUA9IaSSmR51gNmRnrw5ChPBEUND3Q-fvqSyElPkMf0NOsrbGSTUeYfxPCY7vM9ng-YkG6OjhvQVZAOer53ZG3JmVP7K_aEijv3v4mPdD8lICKnFedbJta70ky_Tx9m9aJV1kjGyrVTQoP4YM3z_c2CUvcK73U0S"
      }
    ],
    shippingAddress: {
      fullName: "Alex Hamilton",
      street: "1248 Sagamore Terrace, Suite B",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90025"
    },
    payment: {
      subtotal: "$79.00",
      shippingFee: "Free Premium Shipping",
      tax: "$10.00",
      total: "$89.00",
      method: "Visa/ShopPay (ending in 4820)"
    }
  },
  "DP-91022": {
    id: "DP-91022",
    email: "customer@donperro.CLUB",
    status: "Delivered",
    orderDate: "Sept 28, 2023",
    estimatedDelivery: "Oct 01, 2023",
    carrier: "UPS Ground",
    trackingNumber: "UPS-DP-819284",
    lastUpdate: "Oct 01, 2023 - 02:15 PM",
    location: "Delivered to Front Porch, Beverly Hills",
    steps: [
      { title: "Order Placed", date: "Sept 28, 2023", done: true },
      { title: "Processing", date: "Sept 29, 2023", done: true },
      { title: "Shipped", date: "Sept 29, 2023", done: true },
      { title: "Out for Delivery", date: "Oct 01, 2023", done: true },
      { title: "Delivered", date: "Oct 01, 2023 - 02:15 PM", done: true }
    ],
    items: [
      {
        title: "Gourmet Organic Treat Bundle",
        variant: "Gift Box Edition",
        quantity: 3,
        price: "$45.50",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6dAvqTfDLclJJ95mAYCwFKyGAF3R6lytp-VJV9UckxghuKhPX9ESKI8SELn0ps1CFfKz3E-ZUBVA6fZ2z39anAtj6DsBNKv6GYBsFXD13Yz5TG81UzatTw2VQ-DU_UxQiRn4-g1AoQ36nmh3Fd9IRUN6mNed1xEfcJ-kR_j85CzZuJU7FWrXPqUJAa6NEluooR0hwaeeiJ2D4xXV_wxlCxjMs9m3qMQ3_r5IXvY9ScgSOh7uCygnnB52TOsOw9WbyjFssl7QR3q00"
      }
    ],
    shippingAddress: {
      fullName: "Alex Hamilton",
      street: "1248 Sagamore Terrace, Suite B",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90025"
    },
    payment: {
      subtotal: "$39.00",
      shippingFee: "$6.50",
      tax: "$0.00",
      total: "$45.50",
      method: "Apple Pay (Mastercard ending in 0831)"
    }
  }
};

export default function TrackOrderView() {
  const searchParams = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [activeOrder, setActiveOrder] = useState<MockOrder | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Load the initial order based on URL or default the preloaded mockup
  useEffect(() => {
    const idParam = searchParams?.get("id");
    if (idParam && MOCK_ORDERS[idParam.trim().toUpperCase()]) {
      const orderId = idParam.trim().toUpperCase();
      setOrderIdInput(orderId);
      setActiveOrder(MOCK_ORDERS[orderId]);
    } else {
      setActiveOrder(MOCK_ORDERS["DP-8420"]);
    }
  }, [searchParams]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSearchAttempted(true);

    const formattedOrderId = orderIdInput.trim().toUpperCase();
    const formattedEmail = emailInput.trim().toLowerCase();

    if (!formattedOrderId) {
      setErrorText("Oops! Please enter a valid Order ID.");
      return;
    }

    const matchedOrder = MOCK_ORDERS[formattedOrderId];
    if (matchedOrder) {
      // If email is specified, verify it, otherwise simply let them track (improving UX)
      if (formattedEmail && matchedOrder.email.toLowerCase() !== formattedEmail) {
        setErrorText("The Order ID and Email combination does not match our system.");
        return;
      }
      setActiveOrder(matchedOrder);
      showNotice(`Found order ${matchedOrder.id} successfully! 📦`);
    } else {
      setErrorText("We couldn't find an order with that reference. Try 'DP-8420' or 'DP-92841'.");
    }
  };

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const triggerLiveCheck = () => {
    showNotice(`Refreshing FedEx carrier logs... Status: ${activeOrder?.status || "Live"}`);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24">
      {/* Toast Notice Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e2924] text-[#e1e3df] text-xs font-bold px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-[#2b3530] animate-slide-in select-none">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <p>{toastMessage}</p>
        </div>
      )}

      {/* Modern Banner Hero */}
      <section className="relative bg-[#1e2924] text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#2b3530_10%] via-[#1e2924_60%] to-transparent opacity-80" />
        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
          
          {/* Breadcrumb Navigator */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-outline-variant/60 uppercase tracking-widest mb-6 select-none">
            <Link href="/" className="hover:text-primary-fixed-dim transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-outline-variant/30" />
            <Link href="/shop" className="hover:text-primary-fixed-dim transition-colors">Boutique</Link>
            <ChevronRight className="w-3 h-3 text-outline-variant/30" />
            <span className="text-outline-variant">Track Shipment</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-3">
            Track My Order
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-outline-variant/80 max-w-xl leading-relaxed">
            Obtain immediate live delivery status, carrier dispatch reference points, and real-time transit telemetry for your companion essentials.
          </p>

          {/* Interactive Search Tool Overlay */}
          <div className="mt-8 max-w-2xl bg-white text-on-surface rounded-2xl p-5 md:p-6 shadow-2xl border border-outline-variant/20">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">
              Search Domestic &amp; Elite cargo orders
            </h3>
            <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 relative">
                <input 
                  type="text" 
                  placeholder="Order ID (e.g. DP-8420)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold"
                />
              </div>
              <div className="md:col-span-4 relative">
                <input 
                  type="email" 
                  placeholder="Billing Email (Optional)"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium"
                />
              </div>
              <button 
                type="submit"
                className="md:col-span-3 bg-primary hover:bg-[#153434] text-white rounded-xl py-3 px-4 font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none"
              >
                <Search className="w-4 h-4" />
                Track
              </button>
            </form>

            {errorText && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-3 flex items-center gap-2 text-error text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 text-error" />
                {errorText}
              </motion.div>
            )}
            
            <p className="mt-3 text-[10px] text-secondary/70 font-sans leading-none">
              💡 Preloaded search suggestions: Type <strong className="text-primary font-bold">DP-8420</strong>, <strong className="text-primary font-bold">DP-92841</strong>, or <strong className="text-primary font-bold">DP-91022</strong>.
            </p>
          </div>

        </div>
      </section>

      {/* Dynamic Tracker Results Block */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 mt-12">
        <AnimatePresence mode="wait">
          {activeOrder ? (
            <motion.div 
              key={activeOrder.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Left Main Dashboard Card */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Active Tracking Progress Step Block */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_30px_rgba(90,96,90,0.03)] border border-secondary/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b border-secondary/10 pb-6 mb-6 gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-secondary font-sans">Order Identifier</span>
                      <h2 className="text-2xl mt-0.5 font-heading font-black text-on-surface">
                        #{activeOrder.id}
                      </h2>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-secondary font-sans block text-left sm:text-right">Shipment Status</span>
                      <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-primary-container text-on-primary-container font-bold text-xs mt-1.5 uppercase tracking-wider select-none border border-primary/20">
                        <Truck className="w-3.5 h-3.5" />
                        {activeOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Estimated info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8.5">
                    <div>
                      <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">Order Date</p>
                      <p className="text-sm font-black text-on-surface mt-1">{activeOrder.orderDate}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">Estimated Delivery</p>
                      <p className="text-sm font-black text-primary mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {activeOrder.estimatedDelivery}
                      </p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">Dispatch Carrier</p>
                      <p className="text-sm font-black text-on-surface mt-1">{activeOrder.carrier}</p>
                    </div>
                  </div>

                  {/* Horizontal visual stepper tracker matching Stitch */}
                  <div className="relative pt-6 pb-2">
                    {/* Stepper background track line */}
                    <div className="absolute top-11.5 left-0 w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 origin-left"
                        style={{ 
                          width: activeOrder.status === "Delivered" 
                            ? "100%" 
                            : activeOrder.status === "Shipped" 
                              ? "60%" 
                              : "30%" 
                        }}
                      />
                    </div>

                    {/* Circles steps list */}
                    <div className="relative flex justify-between gap-1">
                      {activeOrder.steps.map((step, idx) => {
                        const isDone = step.done;
                        const isCurrent = isDone && (idx === activeOrder.steps.length - 1 || !activeOrder.steps[idx + 1]?.done);

                        return (
                          <div key={idx} className="flex flex-col items-center text-center max-w-[130px]">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow-md ${
                                isCurrent 
                                  ? "bg-[#6a5f00] text-white ring-4 ring-primary/20 animate-pulse border-2 border-primary" 
                                  : isDone
                                    ? "bg-primary text-white border-2 border-primary"
                                    : "bg-white text-secondary border-2 border-outline-variant"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 fill-white text-primary" style={{ stroke: "#6a5f00" }} />
                              ) : (
                                <Clock className="w-4 h-4 text-outline" />
                              )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold mt-3 leading-tight ${isDone ? "text-on-surface font-black" : "text-secondary"}`}>
                              {step.title}
                            </span>
                            <span className="text-[9px] font-mono text-secondary-variant mt-0.5 leading-none">
                              {step.date.split(",")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Tracking Logistics Metadata details */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_30px_rgba(90,96,90,0.03)] border border-secondary/10">
                  <h3 className="text-base font-bold font-heading text-[#191c1c] border-b border-secondary/10 pb-4 mb-5">
                    Live Dispatch Logistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-secondary/5">
                        <Package className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Tracking Reference</p>
                          <p className="text-sm font-mono font-bold text-on-surface select-all mt-0.5">{activeOrder.trackingNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-secondary/5">
                        <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Logistic Partner</p>
                          <p className="text-sm font-bold text-on-surface mt-0.5">{activeOrder.carrier} Elite Network</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-secondary/5">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Last Telemetry Timestamp</p>
                          <p className="text-sm font-bold text-on-surface mt-0.5">{activeOrder.lastUpdate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-secondary/5">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Current Location</p>
                          <p className="text-sm font-bold text-on-surface mt-0.5">{activeOrder.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button 
                      onClick={triggerLiveCheck}
                      className="bg-primary hover:bg-[#153434] hover:shadow-lg text-white font-bold text-xs px-6 py-3.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-2 select-none"
                    >
                      <Truck className="w-4 h-4" />
                      Track Shipment Live
                    </button>
                    <a 
                      href={`https://www.fedex.com/en-us/home.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-secondary/35 text-secondary hover:text-primary hover:bg-secondary/5 font-bold text-xs px-6 py-3.5 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer select-none"
                    >
                      Carrier Portal
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Tracked items list matching Order Summary */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0px_4px_30px_rgba(90,96,90,0.03)] border border-secondary/10">
                  <h3 className="text-base font-bold font-heading text-[#191c1c] mb-6">
                    Items in This Pack ({activeOrder.items.reduce((accum, item) => accum + item.quantity, 0)})
                  </h3>
                  <div className="divide-y divide-secondary/10">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <div className="w-18 h-18 relative rounded-xl bg-surface-container border border-secondary/10 overflow-hidden flex-shrink-0">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.title}
                              fill
                              sizes="72px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface hover:text-primary transition-colors font-sans">
                              {item.title}
                            </h4>
                            <p className="text-xs font-semibold text-secondary/80 mt-0.5">
                              {item.variant} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-sans font-extrabold text-primary text-sm sm:text-base">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Right Sidebar shipping address and payment calculations */}
              <aside className="lg:col-span-4 space-y-6">
                
                {/* Shipping address info card */}
                <div className="bg-white rounded-2xl p-6.5 border border-secondary/10 shadow-[0px_4px_30px_rgba(90,96,90,0.03)]">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#191c1c] border-b border-secondary/10 pb-3.5 mb-4 flex items-center gap-1.5 select-none font-sans">
                    <MapPin className="w-4 h-4 text-primary" />
                    Boutique Destination
                  </h4>
                  <div className="space-y-1.5 font-sans">
                    <p className="text-sm font-extrabold text-on-surface">
                      {activeOrder.shippingAddress.fullName}
                    </p>
                    <p className="text-xs text-secondary/90 leading-relaxed font-medium">
                      {activeOrder.shippingAddress.street}
                      <br />
                      {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zipCode}
                    </p>
                    <p className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 mt-1 font-mono">
                      📍 Geocoded Home Delivery
                    </p>
                  </div>
                </div>

                {/* Subtotals & Payment cards matching the mockup specs */}
                <div className="bg-white rounded-2xl p-6.5 border border-secondary/10 shadow-[0px_4px_30px_rgba(90,96,90,0.03)] font-sans">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#191c1c] border-b border-secondary/10 pb-3.5 mb-4 flex items-center gap-1.5 select-none">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Receipt Summary
                  </h4>
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between text-xs font-medium text-secondary">
                      <span>Subtotal</span>
                      <span className="text-on-surface font-extrabold">{activeOrder.payment.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-secondary">
                      <span>Shipping Fee</span>
                      <span className="text-on-surface font-bold">{activeOrder.payment.shippingFee}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-secondary">
                      <span>Assessed Tax</span>
                      <span className="text-on-surface font-bold">{activeOrder.payment.tax}</span>
                    </div>
                    <div className="pt-3 border-t border-secondary/10 flex justify-between font-heading font-black text-[#191c1c] text-lg">
                      <span>Total Price</span>
                      <span className="text-primary font-extrabold">{activeOrder.payment.total}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-secondary/10 flex items-center gap-2 text-[11px] font-mono font-medium text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Paid via {activeOrder.payment.method}
                  </div>
                </div>

                {/* Help support callout */}
                <div className="p-6 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-1 flex items-center gap-1 select-none">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Need package assistance?
                  </h4>
                  <p className="text-xxs sm:text-xs text-secondary/80 leading-relaxed font-medium mb-4">
                    Our pet delight representatives are trained to coordinate carrier delays 24 hours a day, 7 days a week.
                  </p>
                  <a 
                    href="mailto:support@donperro.club" 
                    className="inline-flex items-center gap-1.5 text-primary font-bold text-xs hover:underline cursor-pointer select-none"
                  >
                    Raise Support Ticket
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </aside>

            </motion.div>
          ) : (
            /* Blank state illustrated search */
            <div className="max-w-md mx-auto text-center py-16 px-6 border border-dashed border-outline-variant/50 rounded-3xl select-none">
              <Truck className="w-12 h-12 text-primary/30 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-heading font-black text-on-surface mb-1">No Active Cargo Loaded</h3>
              <p className="text-xs text-secondary mb-6 leading-relaxed max-w-sm mx-auto">
                Enter your order tracking reference in the search above to display geocoded delivery statuses.
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
