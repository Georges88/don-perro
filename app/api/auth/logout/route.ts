import { NextResponse } from "next/server";
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_EXPIRES_COOKIE,
  CUSTOMER_ID_TOKEN_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
} from "@/lib/customerAccount";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.delete(CUSTOMER_ACCESS_COOKIE);
  response.cookies.delete(CUSTOMER_REFRESH_COOKIE);
  response.cookies.delete(CUSTOMER_EXPIRES_COOKIE);
  response.cookies.delete(CUSTOMER_ID_TOKEN_COOKIE);

  return response;
}
