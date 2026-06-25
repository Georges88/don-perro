import OrderConfirmedView from "@/components/order/OrderConfirmedView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | Don Perro",
  description: "Your order has been placed successfully. Thank you for shopping with Don Perro!",
};

export default function OrderConfirmedPage() {
  return <OrderConfirmedView />;
}
