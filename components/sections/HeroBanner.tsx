import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="relative hero-gradient py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Copy Column */}
        <div className="flex-1 space-y-6 text-left z-10">
          <span className="inline-block px-4 py-1.5 bg-primary-container text-on-primary-container rounded-full text-xs font-bold tracking-widest uppercase">
            Premium Selection
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-on-background leading-tight tracking-tight">
            Premium Care for Your Best Friend
          </h1>
          <p className="text-lg text-secondary leading-relaxed max-w-xl">
            Discover curated nutrition and high-quality accessories designed for the well-being of your beloved pets. Only the best for those who love you most.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/shop" 
              className="bg-primary text-on-primary px-8 py-4 rounded-full font-semibold text-sm hover:scale-105 hover:bg-opacity-95 shadow-[0_4px_14px_0_rgba(106,95,0,0.3)] duration-200 transition-all text-center"
            >
              Shop Now
            </Link>
            <Link 
              href="/#categories" 
              className="border-2 border-secondary text-secondary px-8 py-4 rounded-full font-semibold text-sm hover:bg-secondary/5 duration-200 transition-all text-center"
            >
              View Menu
            </Link>
          </div>
        </div>

        {/* Right Image Frame Column */}
        <div className="flex-1 relative w-full max-w-lg md:max-w-none">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-[1.02]">
            <img 
              alt="Premium Golden Retriever" 
              className="w-full h-auto aspect-[4/3] md:aspect-square lg:aspect-[4/3] object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2jMi9e44N7ndJsGptFwHPSCUUrrRc0_hyVQ2FyNg1Z4LtA6icmdGOtIFzks3hOPL40Qm2e9qZ5U1OKGnaaCfaRDMb8ZDfPumyjis-OL2JGlZN8gly3gtS2iNgGwIcy0IkcouJvIh5_lgU_KA9pCJ4EXcB3Mk_n07c2oYzEp1xaIlogCc-s24LBXC6Mpwtk1F9yPEY2D4WSjj_Yruu1JVOZ2_hTFbaVUxBR3kCBL_gnIuiXd9UFD-OXKFanj91wAO9rB4GgtX-0K8"
              loading="eager"
            />
          </div>
          {/* Subtle Ambient Decorative Gradients */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary-fixed rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-tertiary-fixed rounded-full blur-3xl opacity-25 pointer-events-none"></div>
        </div>

      </div>
    </section>
  );
}
