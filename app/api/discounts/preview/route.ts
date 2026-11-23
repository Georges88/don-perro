import { NextResponse } from "next/server";
import { previewAutomaticDiscounts } from "@/lib/shopify";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { variantIds?: unknown };
    const variantIds = Array.isArray(body.variantIds)
      ? Array.from(new Set(
          body.variantIds.filter((id): id is string => (
            typeof id === "string" && id.startsWith("gid://shopify/ProductVariant/")
          )),
        )).slice(0, 50)
      : [];

    if (!variantIds.length) {
      return NextResponse.json({ discounts: {} });
    }

    const previews = await previewAutomaticDiscounts(variantIds);
    const discounts = Object.fromEntries(previews.map((preview) => [preview.variantId, preview]));

    return NextResponse.json(
      { discounts },
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (error) {
    console.error("Unable to preview Shopify automatic discounts", error);
    return NextResponse.json({ discounts: {} }, { status: 502 });
  }
}
