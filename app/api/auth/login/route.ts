import { NextResponse } from "next/server";
import {
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  createCodeChallenge,
  getCustomerAccountConfig,
  getOpenIdConfiguration,
  randomToken,
} from "@/lib/customerAccount";

const isProduction = process.env.NODE_ENV === "production";
const OAUTH_RETURN_TO_COOKIE = "don_perro_oauth_return_to";

function getSafeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account?authenticated=1";
  return value;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const loginHint = requestUrl.searchParams.get("login_hint")?.trim();
    const returnTo = getSafeReturnTo(requestUrl.searchParams.get("return_to"));
    const { domain, clientId, redirectUri } = getCustomerAccountConfig();
    const discovery = await getOpenIdConfiguration(domain);
    const state = randomToken();
    const nonce = randomToken(16);
    const verifier = randomToken();
    const challenge = createCodeChallenge(verifier);

    const authorizationUrl = new URL(discovery.authorization_endpoint);
    authorizationUrl.searchParams.set("scope", "openid email customer-account-api:full");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    authorizationUrl.searchParams.set("prompt", "login");
    authorizationUrl.searchParams.set("max_age", "0");

    if (loginHint) {
      authorizationUrl.searchParams.set("login_hint", loginHint);
    }

    const response = NextResponse.redirect(authorizationUrl);
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: isProduction,
      path: "/",
      maxAge: 10 * 60,
    };

    response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
    response.cookies.set(OAUTH_NONCE_COOKIE, nonce, cookieOptions);
    response.cookies.set(OAUTH_VERIFIER_COOKIE, verifier, cookieOptions);
    response.cookies.set(OAUTH_RETURN_TO_COOKIE, returnTo, cookieOptions);
    response.cookies.delete("don_perro_customer_access");
    response.cookies.delete("don_perro_customer_refresh");
    response.cookies.delete("don_perro_customer_expires");
    response.cookies.delete("don_perro_customer_id");

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start Shopify customer login.";
    return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(message)}`, request.url));
  }
}
