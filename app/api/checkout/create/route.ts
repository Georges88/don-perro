import { NextResponse } from "next/server";
import { createShopifyCart, ShopifyCheckoutAddressPreference } from "@/lib/shopify";

interface CheckoutLineInput {
  selectedVariantId?: string;
  quantity?: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const address = normalizeCheckoutAddress(body.address);
    const linesInput = Array.isArray(body.lines) ? body.lines as CheckoutLineInput[] : [];
    const lines = linesInput
      .map((line) => ({
        merchandiseId: String(line.selectedVariantId || ""),
        quantity: Math.max(1, Number(line.quantity || 1)),
      }))
      .filter((line) => line.merchandiseId.startsWith("gid://shopify/ProductVariant/"));

    if (!lines.length) {
      return NextResponse.json({ error: "Your cart does not contain Shopify product variants." }, { status: 400 });
    }

    const cart = await createShopifyCart(lines, email, address);
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl, cartId: cart.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Shopify checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeCheckoutAddress(value: unknown): ShopifyCheckoutAddressPreference | undefined {
  if (!value || typeof value !== "object") return undefined;

  const address = value as Record<string, unknown>;
  const address1 = typeof address.address1 === "string" ? address.address1.trim() : "";
  const city = typeof address.city === "string" ? address.city.trim() : "";

  if (!address1 || !city) return undefined;

  return {
    firstName: typeof address.firstName === "string" ? address.firstName.trim() : undefined,
    lastName: typeof address.lastName === "string" ? address.lastName.trim() : undefined,
    phone: typeof address.phone === "string" ? address.phone.trim() : undefined,
    address1,
    address2: typeof address.address2 === "string" ? address.address2.trim() : undefined,
    city,
    country: typeof address.country === "string" ? address.country.trim() : "Lebanon",
  };
}
