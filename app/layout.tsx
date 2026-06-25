import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Don Perro | Premium Pet Store & Dog Hotel",
  description: "Bespoke organic nutrition, custom handcrafted accessories, and comfortable dog hotel boarding suites for your beloved companion.",
  keywords: ["pet store", "dog hotel", "dog food", "organic pet treats", "dog boarding", "cat food", "pet boutique"],
  openGraph: {
    title: "Don Perro | Premium Pet Store & Dog Hotel",
    description: "Discover curated nutrition and high-quality accessories designed for the well-being of your beloved pets.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth font-sans">
      <body className="bg-background text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container antialiased flex flex-col min-h-screen">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
