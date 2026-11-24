import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, BellRing, PackageSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Tracking Coming Soon | Don Perro",
  description: "Don Perro order tracking is coming soon.",
};

export default function TrackOrderPage() {
  return (
    <main className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-background px-6 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/40 blur-3xl md:h-96 md:w-96"
      />

      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-outline-variant/50 bg-white/90 px-6 py-12 text-center shadow-[0_24px_70px_rgba(35,42,36,0.08)] backdrop-blur-sm md:px-14 md:py-16">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm">
          <PackageSearch className="h-10 w-10" aria-hidden="true" />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          Coming Soon
        </div>

        <h1 className="mt-5 font-heading text-4xl font-black tracking-tight text-on-surface md:text-5xl">
          Order tracking is on the way
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-secondary md:text-base">
          We&apos;re preparing a simple way for you to follow your Don Perro order
          from checkout to delivery. This feature will be available soon.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-on-primary shadow-md transition hover:opacity-90"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-w-44 items-center justify-center rounded-full border border-outline-variant bg-white px-6 py-3.5 text-sm font-bold text-on-surface transition hover:bg-surface-container-low"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
