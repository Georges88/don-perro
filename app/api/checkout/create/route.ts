import { NextResponse } from "next/server";
import { createShopifyCart } from "@/lib/shopify";
import { CUSTOMER_ACCESS_COOKIE } from "@/lib/customerAccount";

interface CheckoutLineInput {
  selectedVariantId?: string;
  quantity?: number;
}

export async function POST(request: Request) {
  try {
    const accessToken = getCookie(request.headers.get("cookie") || "", CUSTOMER_ACCESS_COOKIE);
    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
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

    const cart = await createShopifyCart(lines, email);
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl, cartId: cart.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Shopify checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getCookie(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
