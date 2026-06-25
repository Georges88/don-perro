import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Don Perro",
  description: "Terms governing your use of the Don Perro website, store, and dog hotel services.",
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    content: <p>These Terms of Service govern your use of the Don Perro website and the products and services made available through it. By accessing the website, creating an account, placing an order, or requesting a reservation, you agree to these terms and our Privacy Policy. If you do not agree, please do not use the service.</p>,
  },
  {
    id: "accounts",
    title: "Accounts and eligibility",
    content: <p>You must be legally able to enter into a binding agreement to make a purchase or reservation. You are responsible for providing accurate information, protecting your account credentials, and notifying us if you believe your account is being used without permission.</p>,
  },
  {
    id: "products",
    title: "Products, pricing, and availability",
    content: <p>We aim to describe and display our products accurately, but colors, packaging, dimensions, and other details may vary. Prices, promotions, and availability may change without notice. Adding an item to a cart does not reserve it. If information is incorrect or an item becomes unavailable, we may correct the information, contact you, substitute only with your permission, or cancel and refund the affected item.</p>,
  },
  {
    id: "orders-payment",
    title: "Orders and payment",
    content: <p>An order is an offer to purchase and is accepted only when we send confirmation that it has been accepted or fulfilled. We may decline or cancel orders for suspected fraud, pricing errors, inventory issues, delivery limitations, or other legitimate reasons. Payments will be handled by the payment methods and providers shown at checkout once ecommerce checkout is activated.</p>,
  },
  {
    id: "delivery-returns",
    title: "Delivery, returns, and refunds",
    content: <p>Delivery estimates are not guarantees and may be affected by carriers, weather, customs, availability, or events beyond our reasonable control. Return eligibility, time limits, product condition requirements, exclusions, and refund methods will be described in our Shipping &amp; Returns Policy and any information shown at checkout.</p>,
  },
  {
    id: "hotel-services",
    title: "Dog hotel and reservation requests",
    content: <p>Submitting a hotel form or WhatsApp message is a request, not a confirmed booking. A reservation becomes confirmed only after Don Perro reviews availability, your pet&apos;s needs, vaccination documentation, health and behavior information, applicable fees, and any additional boarding agreement. You are responsible for providing complete and accurate information relevant to the safe care of your pet.</p>,
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: <p>You may not misuse the website, interfere with its operation, attempt unauthorized access, introduce malicious code, scrape content at scale, impersonate another person, submit false information, or use the service for unlawful or harmful purposes. We may restrict access where reasonably necessary to protect customers, pets, staff, or our systems.</p>,
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: <p>The Don Perro name, branding, website design, text, graphics, product presentation, and other original materials are owned by or licensed to Don Perro and are protected by applicable intellectual-property laws. Personal, non-commercial use of the website does not transfer any ownership rights to you.</p>,
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    content: <p>Our website may connect to services operated by others, including Shopify, payment providers, delivery services, and WhatsApp. Their own terms and privacy practices apply when you use their services. Don Perro is not responsible for third-party websites or services outside our reasonable control.</p>,
  },
  {
    id: "disclaimers-liability",
    title: "Disclaimers and limitation of liability",
    content: <p>To the extent permitted by applicable law, the website is provided on an &quot;as available&quot; basis. Nothing on the website is veterinary, medical, or nutritional advice for a particular animal. Don Perro does not exclude liability that cannot legally be excluded, but otherwise will not be liable for indirect or consequential loss arising from use of the website or events outside our reasonable control.</p>,
  },
  {
    id: "law-changes-contact",
    title: "Applicable law, changes, and contact",
    content: <p>These terms are governed by the laws applicable in Lebanon, without limiting any mandatory consumer rights that apply to you. We may revise these terms as our store and services develop. Updated terms will be published here with a new effective date. Questions can be sent to hello@donperro.com or delivered to Don Perro, Zgharta Main Road, Ehden, Lebanon.</p>,
  },
];

export default function TermsPage() {
  return <LegalPage eyebrow="Clear terms, considered care" title="Terms of Service" description="These terms set out the practical rules for using the Don Perro website, purchasing boutique products, and requesting care for your pet." effectiveDate="June 23, 2026" sections={sections} />;
}
