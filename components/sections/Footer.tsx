import Link from "next/link";
import { Instagram, Facebook, CreditCard, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-16 px-6 md:px-16 bg-secondary text-on-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Core dynamic content mapping */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Identity Card */}
          <div className="space-y-4">
            <span className="text-xl font-bold font-heading text-primary-fixed tracking-tight">
              Don Perro
            </span>
            <p className="text-xs md:text-sm text-on-secondary/80 leading-relaxed">
              Providing premium organic nutrition, comfortable boarding, and
              curated bespoke style for your family members since 2024.
            </p>

            {/* Social / Media shortcuts */}
            <div className="flex gap-4 pt-2">
              <a
                href="https://www.instagram.com/don_perroleb?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-on-secondary/5 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors rounded-full"
                aria-label="Don Perro on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1FCxb4hpe6/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-on-secondary/5 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors rounded-full"
                aria-label="Don Perro on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@don_perroleb?_r=1&_t=ZS-9BeZM4ljetw"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-on-secondary/5 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors rounded-full"
                aria-label="Don Perro on TikTok"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 7.917v4.034A9.948 9.948 0 0 1 16 10v4.5a6.5 6.5 0 1 1-8-6.326V12.5a2.5 2.5 0 1 0 4 2V3h4.083A6.005 6.005 0 0 0 21 7.917Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Buy Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-fixed">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-on-secondary/80">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-primary-fixed transition-colors"
                >
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/#best-sellers"
                  className="hover:text-primary-fixed transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/#featured-products"
                  className="hover:text-primary-fixed transition-colors"
                >
                  Featured Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-fixed">
              Support
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-on-secondary/80">
              <li>
                <Link
                  href="/track-order"
                  className="inline-flex items-center gap-2 hover:text-primary-fixed transition-colors"
                >
                  Track Your Order
                  <span className="rounded-full bg-on-secondary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-fixed">
                    Soon
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary-fixed transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary-fixed transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Location details */}
          <div className="space-y-4 text-xs md:text-sm text-on-secondary/80">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary-fixed">
              Visit Store
            </h4>
            <p className="leading-relaxed">
              Zgharta, Main Road
              <br />
              Ehden
            </p>

            <p>
              +961 71 66 10 11
              <br />
              +961 06 66 09 29
            </p>
          </div>
        </div>

        {/* Bottom Bar items with secure checkout signals */}
        <div className="mt-16 pt-6 border-t border-on-secondary/15 flex flex-col sm:flex-row justify-between items-center text-xs text-on-secondary/50 gap-4">
          <p>© 2026 Don Perro Premium Pet Store. All rights reserved.</p>

          <div className="flex items-center gap-4 text-on-secondary/60">
            <CreditCard className="w-5 h-5 pointer-events-none" />
            <ShieldCheck className="w-5 h-5 pointer-events-none" />
            <span className="text-[10px] tracking-wider uppercase">
              Secure SSL Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
