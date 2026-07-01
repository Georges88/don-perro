import { NextResponse } from "next/server";
import { CUSTOMER_ACCESS_COOKIE, getCustomerAccountUser } from "@/lib/customerAccount";
import { createShopifyCart, ShopifyCheckoutAddressPreference } from "@/lib/shopify";

interface CheckoutLineInput {
  selectedVariantId?: string;
  quantity?: number;
}

export async function POST(request: Request) {
  try {
    const accessToken = getCookie(request.headers.get("cookie") || "", CUSTOMER_ACCESS_COOKIE);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Please sign in before continuing to checkout.", loginUrl: "/login?returnTo=/cart" },
        { status: 401 },
      );
    }

    let customer;
    try {
      customer = await getCustomerAccountUser(accessToken);
    } catch {
      return NextResponse.json(
        { error: "Please sign in again before continuing to checkout.", loginUrl: "/login?returnTo=/cart" },
        { status: 401 },
      );
    }
    const body = await request.json();
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

    const cart = await createShopifyCart(lines, customer.email, address);
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

function normalizeCheckoutAddress(value: unknown): ShopifyCheckoutAddressPreference | undefined {
  if (!value || typeof value !== "object") return undefined;

  const address = value as Record<string, unknown>;
  const address1 = typeof address.address1 === "string" ? address.address1.trim() : "";
  const city = typeof address.city === "string" ? address.city.trim() : "";

  if (!address1 || !city) return undefined;

  return {
    firstName: typeof address.firstName === "string" ? address.firstName.trim() : undefined,
    lastName: typeof address.lastName === "string" ? address.lastName.trim() : undefined,
    phone: typeof address.phone === "string" ? normalizeCheckoutPhone(address.phone) : undefined,
    address1,
    address2: typeof address.address2 === "string" ? address.address2.trim() : undefined,
    city,
    country: typeof address.country === "string" ? address.country.trim() : "Lebanon",
  };
}

function normalizeCheckoutPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const compact = trimmed.replace(/[()\-\s.]/g, "");
  if (/^\+\d{8,15}$/.test(compact)) return compact;
  if (/^00\d{8,15}$/.test(compact)) return `+${compact.slice(2)}`;

  const digits = compact.replace(/\D/g, "");
  if (!digits) return undefined;

  if (digits.startsWith("961") && digits.length >= 10 && digits.length <= 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length >= 7 && digits.length <= 9) {
    return `+961${digits.slice(1)}`;
  }

  if (digits.length >= 7 && digits.length <= 8) {
    return `+961${digits}`;
  }

  return undefined;
}
