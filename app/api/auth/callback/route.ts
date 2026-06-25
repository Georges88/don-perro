import { NextResponse } from "next/server";
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_EXPIRES_COOKIE,
  CUSTOMER_ID_TOKEN_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  exchangeCustomerAuthorizationCode,
} from "@/lib/customerAccount";

const isProduction = process.env.NODE_ENV === "production";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (error) {
    return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(error)}`, request.url));
  }

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookieHeader(cookieHeader);
    const savedState = cookies[OAUTH_STATE_COOKIE];
    const verifier = cookies[OAUTH_VERIFIER_COOKIE];

    if (!code || !state || !savedState || state !== savedState || !verifier) {
      throw new Error("Shopify customer login could not be verified. Please try again.");
    }

    const token = await exchangeCustomerAuthorizationCode(code, verifier);
    const response = NextResponse.redirect(new URL("/account?authenticated=1", request.url));
    const baseCookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: isProduction,
      path: "/",
    };
    const maxAge = token.expires_in || 60 * 60;

    response.cookies.set(CUSTOMER_ACCESS_COOKIE, token.access_token, {
      ...baseCookieOptions,
      maxAge,
    });
    response.cookies.set(CUSTOMER_EXPIRES_COOKIE, String(Date.now() + maxAge * 1000), {
      ...baseCookieOptions,
      maxAge,
    });

    if (token.refresh_token) {
      response.cookies.set(CUSTOMER_REFRESH_COOKIE, token.refresh_token, {
        ...baseCookieOptions,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    if (token.id_token) {
      response.cookies.set(CUSTOMER_ID_TOKEN_COOKIE, token.id_token, {
        ...baseCookieOptions,
        maxAge,
      });
    }

    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);
    response.cookies.delete(OAUTH_NONCE_COOKIE);

    return response;
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : "Unable to finish Shopify customer login.";
    return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(message)}`, request.url));
  }
}

function parseCookieHeader(cookieHeader: string) {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        if (separatorIndex === -1) return [cookie, ""];
        return [cookie.slice(0, separatorIndex), decodeURIComponent(cookie.slice(separatorIndex + 1))];
      }),
  );
}
