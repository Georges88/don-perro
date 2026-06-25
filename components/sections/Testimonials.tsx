import { getTestimonials } from "@/lib/shopify";
import { Star } from "lucide-react";

export default async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section id="testimonials" className="py-20 max-w-7xl mx-auto px-6 md:px-16 scroll-mt-20">
      
      {/* Title */}
      <h2 className="text-3xl font-bold font-heading text-on-background text-center mb-12 tracking-tight">
        Happy Tails
      </h2>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((test) => (
          <div 
            key={test.id} 
            className="bg-white p-8 rounded-2xl border border-secondary/10 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Gold Stars */}
              <div className="flex gap-1 text-primary-container mb-4">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Quote Copy */}
              <p className="text-sm font-medium italic text-secondary leading-relaxed mb-6">
                "{test.quote}"
              </p>
            </div>

            {/* Author details */}
            <div className="flex items-center gap-3 pt-4 border-t border-secondary/5 mt-auto">
              <div className="w-11 h-11 rounded-full bg-tertiary-container overflow-hidden flex-shrink-0">
                <img 
                  alt={test.name} 
                  className="w-full h-full object-cover" 
                  src={test.avatarUrl}
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-on-background">
                  {test.name}
                </p>
                <p className="text-xs text-outline font-medium">
                  {test.role}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
}
