"use client";

import { useState } from "react";
import Link from "next/link";
import FormNotice from "@/components/ui/FormNotice";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return setFormError("Please enter your email address to join the club.");
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setFormError("Please enter a valid email address, such as name@example.com.");
    setFormError(null);
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-16 mb-20">
      <div className="bg-inverse-surface text-inverse-on-surface rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl border border-secondary/15">
        
        {/* Left Column Content */}
        <div className="flex-1 z-10 space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading tracking-tight">
            Join the Don Perro Club
          </h2>
          <p className="text-base text-inverse-on-surface/80 leading-relaxed max-w-lg">
            Receive exclusive offers, pet care tips, and be the first to know about our new organic arrivals. Only pure premium goodness.
          </p>
          
          {subscribed ? (
            <div className="p-4 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-2xl max-w-md animate-fade-in">
              <p className="text-sm font-bold text-primary-fixed">
                ✓ Thank you! You've successfully subscribed to the Club.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-3 max-w-md">
              <FormNotice message={formError} />
              <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                required
                placeholder="Enter your email address" 
                className="flex-1 px-6 py-4 rounded-full border-0 text-on-surface bg-surface text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <button 
                type="submit" 
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-semibold text-sm hover:scale-105 active:scale-95 duration-200 transition-all cursor-pointer whitespace-nowrap"
              >
                Subscribe Now
              </button>
              </div>
            </form>
          )}

          <p className="text-[11px] text-inverse-on-surface/50 font-medium">
            By subscribing, you agree to our <Link href="/privacy" className="underline hover:text-primary-fixed">Privacy Policy</Link> and <Link href="/terms" className="underline hover:text-primary-fixed">Terms of Service</Link>.
          </p>
        </div>

        {/* Right Column Graphic */}
        <div className="flex-1 hidden md:block z-10 relative">
          <div className="relative w-3/4 mx-auto rotate-3 hover:rotate-0 transition-transform duration-500 scale-105">
            <img 
              className="rounded-2xl shadow-2xl object-cover aspect-[4/5] max-h-80 w-full" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWW6ZGwolE8Ng-5_B9tIvRZgj2VKbxE1WQeI4R8xOOdIzQ9bZa9RBdPP8aLCmgf9CY_QgPp396xjPk-pDfeQU95ozUBHQuCCtb7nhQTM7-ExAVMwJo0ahaVUe2pbD12WmE_nguCu-ddRZq1YDWX9WRx53bWZ7QZnoMDiGvtUjCX9iRHwNDLfGTd3W-9fXshfIB_THnCtT-tlizmZhjSB-jeNVOJHW82TB65yhWGvYKP6P520y-iQq1cB_9lPNYgNxJiY7fOmTvwF8" 
              alt="Golden Retriever Club ambassador"
              loading="lazy"
            />
          </div>
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-tertiary-fixed/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

      </div>
    </section>
  );
}
