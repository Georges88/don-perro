import Link from "next/link";
import { getFeaturedProducts } from "@/lib/shopify";
import { Star } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductCardActions from "@/components/shop/ProductCardActions";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section id="featured-products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        
        {/* Title Group */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-3">
            Handpicked
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-on-background tracking-tight">
            Featured Products
          </h2>
          <p className="text-base text-secondary max-w-xl mx-auto mt-2">
            Exclusively designed to elevate your pet's comfort, health, and style.
          </p>
        </div>

        {/* Layout: Large Left-Hero Featured block + Smaller right grid items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Highlight Hero Block (Left 5-Cols) */}
          <div className="lg:col-span-5 bg-surface rounded-3xl p-8 border border-secondary/5 flex flex-col justify-between overflow-hidden relative group shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <Star className="w-4 h-4 fill-primary" />
                <Star className="w-4 h-4 fill-primary" />
                <Star className="w-4 h-4 fill-primary" />
                <Star className="w-4 h-4 fill-primary" />
                <span className="text-xs text-secondary font-bold ml-1">5.0 (120 reviews)</span>
              </div>
              <h3 className="text-2xl font-bold font-heading text-on-background">
                Ultra-Comfort Bed
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Our #1 customized orthotic bed. Dual density memory foam core provides unparalleled relief to senior or playful pups alike. Wrapped in an effortlessly removable, washable boutique weave.
              </p>
              <div className="text-lg font-bold text-primary">
                $120.00
              </div>
            </div>

            <div className="mt-8 transition-transform duration-500 group-hover:scale-105">
              <img 
                alt="Luxury Orthopedic Dog Bed" 
                className="w-full h-56 object-cover rounded-2xl shadow-lg border border-secondary/10" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGwNvhcyrG_7tSqbOSaQlmUameDvjbrsUjTjsQHIwepL5VZ876xmME5YW1v0Da4ozNU-ZHzsfT6vQ6pSlvbcTjonAiXpxzl50Y-5dvj7UCgSEhFFgyNDOqDzjhEGlx7YOMV2MI83FvAzsB9IsXqH1utKqM6wxPI91a9qXE3IjM4vE3Ny09KYTDpTbVVJnOzsdr31AtVwZ4OlxVXQMyc0L2PK8iSfpmNAjpwxl0CYAWFRwucP_WlE1oimSru-iF7zRXsLAJv5N30pE"
                loading="lazy"
              />
            </div>
            
            <div className="pt-6">
              <Link 
                href="/products/ultra-comfort-orthopedic-bed"
                className="inline-flex bg-on-background text-background px-6 py-3 rounded-full text-xs font-bold hover:bg-primary transition-colors cursor-pointer"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Grid items (Right 7-Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.slice(0, 4).map((product) => {
              const price = parseFloat(product.priceRange.minVariantPrice.amount);
              
              return (
                <div 
                  key={product.id}
                  className="bg-surface rounded-2xl p-4 border border-secondary/5 flex flex-col justify-between group hover:shadow-lg transition-all duration-300 relative"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-white mb-4 relative">
                    <Link href={`/products/${product.handle}`} className="block w-full h-full cursor-pointer">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={product.featuredImage.url} 
                        alt={product.featuredImage.altText || product.title}
                        loading="lazy"
                      />
                    </Link>
                    <ProductCardActions product={product} className="absolute right-2.5 top-2.5 z-10" />
                    <AddToCartButton
                      product={product}
                      className="absolute bottom-2.5 right-2.5 bg-white w-9 h-9 rounded-full flex items-center justify-center text-primary shadow hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer z-10"
                    />
                  </div>
                  
                  <Link href={`/products/${product.handle}`} className="cursor-pointer">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                      {product.productType}
                    </span>
                    <h4 className="text-sm font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 mt-0.5 font-sans">
                      {product.title}
                    </h4>
                    <div className="text-sm font-extrabold text-primary mt-1">
                      ${price.toFixed(2)}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
