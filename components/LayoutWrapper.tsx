"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isExcludedPage = 
    pathname === "/login" || 
    pathname === "/checkout" || 
    pathname?.startsWith("/checkout") || 
    pathname === "/order-confirmed";

  return (
    <>
      {/* Conditionally render header based on current route */}
      {!isExcludedPage && (
        <Suspense fallback={<div className="h-20 bg-background border-b border-secondary-container/20" />}>
          <Header />
        </Suspense>
      )}
      
      {/* Render core screen content */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Conditionally render footer based on current route */}
      {!isExcludedPage && <Footer />}
      <WhatsAppButton />
    </>
  );
}
