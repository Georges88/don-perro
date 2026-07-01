import { NextResponse } from "next/server";
import { CUSTOMER_ACCESS_COOKIE, updateCustomerAccountProfile } from "@/lib/customerAccount";

const phonePattern = /^[+()\-.\s0-9]{7,}$/;

export async function POST(request: Request) {
  try {
    const accessToken = getCookie(request.headers.get("cookie") || "", CUSTOMER_ACCESS_COOKIE);
    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in before updating your profile." }, { status: 401 });
    }

    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = String(body.phone || "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Please enter your first and last name." }, { status: 400 });
    }

    if (!phonePattern.test(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    const customer = await updateCustomerAccountProfile(accessToken, { firstName, lastName, phone });

    return NextResponse.json({
      user: {
        ...customer,
        phone,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update your profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function getCookie(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
