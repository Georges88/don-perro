import { NextResponse } from "next/server";
import { createShopifyCustomer } from "@/lib/shopifyCustomers";

const emailPattern = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const petPreference = body.petPreference ?? null;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Please enter your first and last name." }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Please choose a password with at least 8 characters." }, { status: 400 });
    }

    if (petPreference && !["dog", "cat", "multiple"].includes(petPreference)) {
      return NextResponse.json({ error: "Please choose a valid pet preference." }, { status: 400 });
    }

    const customer = await createShopifyCustomer({
      firstName,
      lastName,
      email,
      password,
      petPreference,
    });

    return NextResponse.json({ customer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create your customer profile.";
    const status = message.includes("environment variables") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
