import { NextResponse } from "next/server";
import {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_EXPIRES_COOKIE,
  CUSTOMER_ID_TOKEN_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
  getCustomerAccountConfig,
  getOpenIdConfiguration,
} from "@/lib/customerAccount";

export async function GET(request: Request) {
  return clearCustomerSession(request, true);
}

export async function POST(request: Request) {
  return clearCustomerSession(request, false);
}

async function clearCustomerSession(request: Request, redirectToShopify: boolean) {
  let response: NextResponse;

  if (redirectToShopify) {
    response = await createShopifyLogoutRedirect(request);
  } else {
    response = NextResponse.json({ ok: true });
  }

  response.cookies.delete(CUSTOMER_ACCESS_COOKIE);
  response.cookies.delete(CUSTOMER_REFRESH_COOKIE);
  response.cookies.delete(CUSTOMER_EXPIRES_COOKIE);
  response.cookies.delete(CUSTOMER_ID_TOKEN_COOKIE);

  return response;
}

async function createShopifyLogoutRedirect(request: Request) {
  try {
    const { domain } = getCustomerAccountConfig();
    const discovery = await getOpenIdConfiguration(domain);
    const returnUrl = new URL("/login", request.url);
    const idToken = getCookie(request.headers.get("cookie") || "", CUSTOMER_ID_TOKEN_COOKIE);

    if (discovery.end_session_endpoint && idToken) {
      const logoutUrl = new URL(discovery.end_session_endpoint);
      logoutUrl.searchParams.set("post_logout_redirect_uri", returnUrl.toString());
      logoutUrl.searchParams.set("id_token_hint", idToken);
      return NextResponse.redirect(logoutUrl);
    }

    return NextResponse.redirect(returnUrl);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

function getCookie(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
