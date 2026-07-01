import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Account | Don Perro",
  description: "Create your Don Perro account through Shopify.",
};

export default function RegisterPage() {
  redirect("/api/auth/login");
}
