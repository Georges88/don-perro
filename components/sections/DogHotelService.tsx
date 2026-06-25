import Link from "next/link";
import { ShieldCheck, Activity, Bed, Users, Sparkles, Heart } from "lucide-react";

export default function DogHotelService() {
  const benefits = [
    { icon: ShieldCheck, text: "Safe & Secure Environment" },
    { icon: Activity, text: "Daily Playtime & Exercise" },
    { icon: Bed, text: "Comfortable Sleeping Areas" },
    { icon: Users, text: "Professional Care Staff" },
    { icon: Sparkles, text: "Clean & Hygienic Facilities" },
    { icon: Heart, text: "Personalized Attention" },
  ];

  return (
    <section id="dog-hotel" className="py-20 bg-surface-container-low overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        
        {/* Title Block */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            Dog Hotel
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-on-background tracking-tight">
            A Home Away From Home for Your Dog
          </h2>
          <p className="text-base text-secondary max-w-2xl mx-auto mt-2">
            Professional dog boarding and care services designed to keep your pet safe, happy, and comfortable while you're away.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Media Column */}
          <div className="relative group w-full">
            <div className="rounded-3xl overflow-hidden shadow-xl transition-all duration-500 group-hover:scale-[1.01] hover:shadow-2xl">
              <img 
                alt="Luxury Dog Hotel Pet Care Suite" 
                className="w-full h-[400px] object-cover" 
                src="/images/dog-hotel-suite.webp"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-fixed/15 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Right Benefits Column */}
          <div className="space-y-6">
            <p className="text-base text-on-surface-variant leading-relaxed">
              At Don Perro Dog Hotel, we provide a secure, clean, and caring environment where dogs receive personalized attention, daily exercise, and comfortable accommodations. Our boutique hotel facility is built on the foundation of premium care and professional devotion.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {benefit.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <Link 
                href="#reservation-form" 
                className="inline-block bg-primary text-on-primary px-8 py-4 rounded-full font-semibold text-sm shadow-md hover:scale-105 active:scale-95 duration-200 transition-all text-center"
              >
                Reserve a Spot
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
