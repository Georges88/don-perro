import { NextResponse } from "next/server";
import { CUSTOMER_ACCESS_COOKIE, getCustomerAccountOrders } from "@/lib/customerAccount";

export async function GET(request: Request) {
  try {
    const accessToken = getCookie(request.headers.get("cookie") || "", CUSTOMER_ACCESS_COOKIE);
    if (!accessToken) {
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const orders = await getCustomerAccountOrders(accessToken);
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load customer orders.";
    return NextResponse.json({ error: message, orders: [] }, { status: 500 });
  }
}

function getCookie(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
