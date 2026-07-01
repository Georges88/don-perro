"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, Loader2, Package, Search } from "lucide-react";

interface TrackableOrder {
  id: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  totalPrice: string;
  itemCount: number;
  title: string;
}

type LoadState = "loading" | "guest" | "ready" | "error";

export default function TrackOrderView() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<TrackableOrder[]>([]);
  const [query, setQuery] = useState(searchParams?.get("id") || "");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/account/orders", { cache: "no-store" });
        const payload = await response.json();

        if (response.status === 401) {
          setLoadState("guest");
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load your orders.");
        }

        setOrders(Array.isArray(payload.orders) ? payload.orders : []);
        setLoadState("ready");
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Unable to load your orders.");
        setLoadState("error");
      }
    };

    loadOrders();
  }, []);

  const normalizedQuery = normalizeOrderNumber(query).toLowerCase();
  const selectedOrder = useMemo(() => {
    if (!normalizedQuery) return orders[0] || null;

    return orders.find((order) => {
      const orderId = normalizeOrderNumber(order.id).toLowerCase();
      return orderId === normalizedQuery || orderId.includes(normalizedQuery);
    }) || null;
  }, [normalizedQuery, orders]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchAttempted(true);
  };

  if (loadState === "loading") {
    return (
      <main className="min-h-screen bg-background px-6 py-24">
        <StatusShell>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-bold text-secondary">Loading your Shopify orders...</p>
          </div>
        </StatusShell>
      </main>
    );
  }

  if (loadState === "guest") {
    return (
      <main className="min-h-screen bg-background px-6 py-24">
        <StatusShell>
          <div className="py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-5 font-heading text-3xl font-black text-on-surface">Sign in to track orders</h1>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-secondary">
              Order status is connected to your Shopify customer account, so sign in to see the status your admin updates in Shopify.
            </p>
            <Link
              href="/login?returnTo=/track-order"
              className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-md transition hover:opacity-90"
            >
              Sign In
            </Link>
          </div>
        </StatusShell>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16 md:py-24">
      <StatusShell>
        <div className="border-b border-outline-variant/30 pb-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Order status</p>
          <h1 className="mt-3 font-heading text-3xl font-black tracking-tight text-on-surface md:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-secondary">
            This page shows only the Shopify order status. When the admin updates fulfillment or payment status in Shopify, the status here updates too.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="order-search">Order number</label>
          <input
            id="order-search"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchAttempted(false);
            }}
            placeholder={orders[0] ? `Order number, e.g. ${displayOrderNumber(orders[0].id)}` : "Order number"}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm font-bold text-on-surface outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wide text-on-primary shadow-md transition hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Track
          </button>
        </form>

        {loadState === "error" && (
          <Notice tone="error" message={errorText || "Unable to load your orders."} />
        )}

        {loadState === "ready" && orders.length === 0 && (
          <Notice tone="neutral" message="No Shopify orders were found for this customer account yet." />
        )}

        {loadState === "ready" && orders.length > 0 && searchAttempted && normalizedQuery && !selectedOrder && (
          <Notice tone="error" message="No order with that number was found in your Shopify customer account." />
        )}

        {selectedOrder && (
          <section className="mt-8 rounded-2xl border border-outline-variant/60 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">Order Number</p>
                <h2 className="mt-1 font-heading text-3xl font-black text-on-surface">{displayOrderNumber(selectedOrder.id)}</h2>
                <p className="mt-2 text-sm font-medium text-secondary">{selectedOrder.title}</p>
              </div>
              <StatusBadge status={getDisplayStatus(selectedOrder)} />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <StatusFact label="Order Date" value={formatOrderDate(selectedOrder.processedAt)} />
              <StatusFact label="Items" value={`${selectedOrder.itemCount || 0}`} />
              <StatusFact label="Total" value={selectedOrder.totalPrice} />
            </div>

            <div className="mt-8 rounded-xl bg-surface-container-low p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Shopify admin statuses</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <StatusFact label="Fulfillment" value={formatRawStatus(selectedOrder.fulfillmentStatus)} />
                <StatusFact label="Payment" value={formatRawStatus(selectedOrder.financialStatus)} />
              </div>
            </div>
          </section>
        )}
      </StatusShell>
    </main>
  );
}

function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-outline-variant/60 bg-white/80 p-6 shadow-sm md:p-9">
      {children}
    </div>
  );
}

function Notice({ tone, message }: { tone: "error" | "neutral"; message: string }) {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : Package;

  return (
    <div className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
      isError
        ? "border-error/20 bg-error-container/20 text-error"
        : "border-outline-variant bg-surface-container-low text-secondary"
    }`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isDone = status === "Delivered" || status === "Paid";
  const Icon = isDone ? CheckCircle2 : Clock;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-xs font-black uppercase tracking-wide text-on-primary-container">
      <Icon className="h-4 w-4" />
      {status}
    </span>
  );
}

function StatusFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-outline-variant/40 bg-surface px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{label}</p>
      <p className="mt-1 text-sm font-black text-on-surface">{value || "Not available"}</p>
    </div>
  );
}

function getDisplayStatus(order: TrackableOrder) {
  const fulfillment = order.fulfillmentStatus.trim().toUpperCase();
  const financial = order.financialStatus.trim().toUpperCase();

  if (["DELIVERED", "FULFILLED"].includes(fulfillment)) return "Delivered";
  if (["IN_PROGRESS", "PARTIALLY_FULFILLED", "ON_HOLD", "SCHEDULED"].includes(fulfillment)) return "In Progress";
  if (["UNFULFILLED", "PENDING"].includes(fulfillment)) return "Processing";
  if (["REFUNDED", "PARTIALLY_REFUNDED", "VOIDED"].includes(financial)) return "Cancelled";
  if (financial === "PAID") return "Paid";

  return formatRawStatus(fulfillment || financial);
}

function normalizeOrderNumber(orderId: string) {
  return orderId.trim().replace(/^#+/, "");
}

function displayOrderNumber(orderId: string) {
  return `#${normalizeOrderNumber(orderId)}`;
}

function formatRawStatus(status: string) {
  if (!status) return "Not available";

  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatOrderDate(date: string) {
  if (!date) return "Not available";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}
