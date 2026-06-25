import { NextResponse } from "next/server";
import { CUSTOMER_ACCESS_COOKIE, getCustomerAccountUser } from "@/lib/customerAccount";

export async function GET(request: Request) {
  try {
    const accessToken = getCookie(request.headers.get("cookie") || "", CUSTOMER_ACCESS_COOKIE);
    if (!accessToken) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await getCustomerAccountUser(accessToken);
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the current customer.";
    return NextResponse.json({ authenticated: false, user: null, error: message }, { status: 401 });
  }
}

function getCookie(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
