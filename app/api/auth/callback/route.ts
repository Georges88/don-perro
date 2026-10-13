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
const OAUTH_RETURN_TO_COOKIE = "don_perro_oauth_return_to";

function getSafeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account?authenticated=1";
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?auth_error=${encodeURIComponent(errorDescription || error)}`, request.url),
    );
  }

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookieHeader(cookieHeader);
    const savedState = cookies[OAUTH_STATE_COOKIE];
    const savedNonce = cookies[OAUTH_NONCE_COOKIE];
    const verifier = cookies[OAUTH_VERIFIER_COOKIE];

    if (!code || !state || !savedState || state !== savedState || !savedNonce || !verifier) {
      throw new Error("Shopify customer login could not be verified. Please try again.");
    }

    const token = await exchangeCustomerAuthorizationCode(code, verifier);
    if (!token.id_token || getIdTokenNonce(token.id_token) !== savedNonce) {
      throw new Error("Shopify customer login nonce validation failed. Please try again.");
    }

    const returnTo = getSafeReturnTo(cookies[OAUTH_RETURN_TO_COOKIE]);
    const response = NextResponse.redirect(new URL(returnTo, request.url));
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
    response.cookies.delete(OAUTH_RETURN_TO_COOKIE);

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

function getIdTokenNonce(idToken: string) {
  const [, encodedPayload] = idToken.split(".");
  if (!encodedPayload) return null;

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as { nonce?: unknown };
  return typeof payload.nonce === "string" ? payload.nonce : null;
}
