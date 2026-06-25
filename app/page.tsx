import HeroBanner from "@/components/sections/HeroBanner";
import ShopByCategory from "@/components/sections/ShopByCategory";
import DogHotelService from "@/components/sections/DogHotelService";
import ReservationForm from "@/components/sections/ReservationForm";
import BestSellers from "@/components/sections/BestSellers";
import TrustedBrands from "@/components/sections/TrustedBrands";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Testimonials from "@/components/sections/Testimonials";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-on-surface antialiased">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Shop by Category (Bento Category Grid) */}
      <ShopByCategory />

      {/* 3. Dog Hotel Service Description */}
      <DogHotelService />

      {/* 4. Dog Hotel Reservation Form */}
      <ReservationForm />

      {/* 5. Best Sellers Section */}
      <BestSellers />

      {/* 6. Trusted Brands Marquee */}
      <TrustedBrands />

      {/* 7. Featured Products Spotlight Grid */}
      <FeaturedProducts />

      {/* 8. Testimonials Section (Happy Tails) */}
      <Testimonials />

      {/* 9. Newsletter Subscription Section */}
      <Newsletter />
    </main>
  );
}
