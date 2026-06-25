import { getBrands } from "@/lib/shopify";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function TrustedBrands() {
  const brands = await getBrands();

  // Duplicate for seamless infinite marquee scroll
  const marqueeList = [...brands, ...brands, ...brands];

  return (
    <section className="bg-surface-container-lowest py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-10 text-center">
        <h2 className="text-3xl font-bold font-heading text-on-background tracking-tight">
          Trusted Brands We Carry
        </h2>
        <p className="text-base text-secondary max-w-xl mx-auto mt-2">
          Shop premium pet products from the world's most trusted pet care brands.
        </p>
      </div>

      <div className="relative group marquee-container">
        {/* Navigation Arrows for Elegant Accents */}
        <button 
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md text-secondary hover:text-primary hover:bg-white transition-all hidden lg:flex items-center justify-center border border-secondary/5 cursor-pointer"
          aria-label="Previous Brand"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md text-secondary hover:text-primary hover:bg-white transition-all hidden lg:flex items-center justify-center border border-secondary/5 cursor-pointer"
          aria-label="Next Brand"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Endless Scrolling Marquee Belt */}
        <div className="flex overflow-hidden relative w-full">
          {/* Track Belt */}
          <div className="flex animate-marquee whitespace-nowrap py-4 gap-6">
            {marqueeList.map((brand, index) => (
              <div 
                key={`${brand.id}-${index}`}
                className="w-40 sm:w-48 md:w-56 h-28 flex-shrink-0 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] border border-surface-variant/30 flex items-center justify-center p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 transform"
              >
                <img 
                  alt={`${brand.name} logo`} 
                  className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100" 
                  src={brand.logoUrl}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
