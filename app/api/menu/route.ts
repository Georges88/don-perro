import { NextResponse } from "next/server";
import { getMenu } from "@/lib/shopify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle") || "main-menu";
  const menu = await getMenu(handle);

  return NextResponse.json({ menu });
}
