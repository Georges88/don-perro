import { redirect } from "next/navigation";

export const metadata = {
  title: "Checkout | Don Perro Premium Pet Store",
  description: "Continue to Shopify checkout from your cart.",
};

export default function CheckoutPage() {
  redirect("/cart");
}
