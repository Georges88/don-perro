import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Don Perro",
  description: "Learn how Don Perro collects, uses, stores, and protects your personal information.",
};

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: <>
      <p>We may collect information you provide when you create an account, place or track an order, join our newsletter, contact us, or request a dog hotel reservation. This can include your name, email address, telephone number, delivery address, pet information, reservation details, and messages.</p>
      <p>Payment details are intended to be processed by our commerce and payment providers. Don Perro should not store complete payment-card numbers on its own systems.</p>
    </>,
  },
  {
    id: "automatic-information",
    title: "Device and browsing information",
    content: <p>When you use our website, our hosting and service providers may receive technical information such as your IP address, browser type, device type, pages visited, referring page, and approximate location. We may also use local browser storage to remember your cart, wishlist, and site preferences.</p>,
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: <>
      <p>We use information to provide and improve our store and hotel services, respond to inquiries, process and deliver orders, manage reservations, prevent misuse, maintain security, and comply with legal obligations.</p>
      <p>Where you have chosen to receive marketing, we may send product news, pet-care content, and offers. You can unsubscribe from marketing communications at any time.</p>
    </>,
  },
  {
    id: "sharing",
    title: "When information is shared",
    content: <p>We may share only the information reasonably necessary with providers that support our website, ecommerce platform, payments, delivery, messaging, analytics, and customer service. This may include Shopify and its connected providers once our store integration is active, and Meta when you choose to contact us through WhatsApp. We may also disclose information when required by law or to protect people, property, or our services.</p>,
  },
  {
    id: "cookies-storage",
    title: "Cookies and local storage",
    content: <p>Our website may use cookies or similar technologies for essential functionality, preferences, performance, and security. During the current preview stage, cart and wishlist details may be kept in your browser&apos;s local storage. You can clear this information through your browser settings, although parts of the website may then reset.</p>,
  },
  {
    id: "retention-security",
    title: "Retention and security",
    content: <p>We keep personal information only for as long as reasonably needed for the purpose for which it was collected, including customer support, accounting, dispute resolution, and legal compliance. We use reasonable organizational and technical safeguards, but no internet transmission or storage method can be guaranteed completely secure.</p>,
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    content: <p>Depending on the law that applies to you, you may request access to, correction of, or deletion of your personal information, object to certain processing, or withdraw consent. You may also opt out of marketing at any time. Contact us using the details below and we will respond as required by applicable law.</p>,
  },
  {
    id: "children",
    title: "Children&apos;s privacy",
    content: <p>Our website and services are intended for adults and are not directed to children. We do not knowingly collect personal information from children without appropriate permission from a parent or guardian.</p>,
  },
  {
    id: "international-services",
    title: "International service providers",
    content: <p>Some providers may process information outside Lebanon. Where this occurs, we expect providers to use appropriate safeguards and handle information in accordance with their contractual and legal obligations.</p>,
  },
  {
    id: "updates-contact",
    title: "Policy updates and contact",
    content: <p>We may update this policy as our services, Shopify integration, or legal obligations change. The effective date above will be revised when material updates are published. Questions or privacy requests can be sent to hello@donperro.com or delivered to Don Perro, Zgharta Main Road, Ehden, Lebanon.</p>,
  },
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="Your privacy matters" title="Privacy Policy" description="This policy explains what information Don Perro may collect, why we use it, and the choices available to you when you visit our store or use our services." effectiveDate="June 23, 2026" sections={sections} />;
}
