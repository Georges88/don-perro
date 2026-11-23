import { NextResponse } from "next/server";
import { previewCartDiscounts } from "@/lib/shopify";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { lines?: unknown };
    const lines = Array.isArray(body.lines)
      ? body.lines.flatMap((line) => {
          if (!line || typeof line !== "object") return [];
          const variantId = "variantId" in line ? line.variantId : undefined;
          const quantity = "quantity" in line ? Number(line.quantity) : 0;

          if (
            typeof variantId !== "string"
            || !variantId.startsWith("gid://shopify/ProductVariant/")
            || !Number.isFinite(quantity)
            || quantity < 1
          ) {
            return [];
          }

          return [{ variantId, quantity: Math.min(99, Math.floor(quantity)) }];
        }).slice(0, 50)
      : [];

    if (!lines.length) {
      return NextResponse.json({ lines: {} });
    }

    const previews = await previewCartDiscounts(lines.map((line) => ({
      merchandiseId: line.variantId,
      quantity: line.quantity,
    })));

    return NextResponse.json({
      lines: Object.fromEntries(previews.map((preview) => [preview.variantId, preview])),
    });
  } catch (error) {
    console.error("Unable to preview Shopify cart discounts", error);
    return NextResponse.json({ lines: {} }, { status: 502 });
  }
}
