import "server-only";

import crypto from "node:crypto";

export interface CustomerAccountUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface OpenIdConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
}

interface CustomerAccountApiConfiguration {
  graphql_api: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: unknown;
}

interface CustomerQueryResponse {
  customer: {
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: {
      emailAddress?: string | null;
    } | null;
  } | null;
}

export const CUSTOMER_ACCESS_COOKIE = "don_perro_customer_access";
export const CUSTOMER_REFRESH_COOKIE = "don_perro_customer_refresh";
export const CUSTOMER_EXPIRES_COOKIE = "don_perro_customer_expires";
export const CUSTOMER_ID_TOKEN_COOKIE = "don_perro_customer_id";
export const OAUTH_STATE_COOKIE = "don_perro_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "don_perro_oauth_verifier";
export const OAUTH_NONCE_COOKIE = "don_perro_oauth_nonce";

export function getCustomerAccountConfig() {
  const domain = process.env.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN?.trim() || process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();
  const redirectUri = process.env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI?.trim();

  if (!domain || !clientId || !redirectUri) {
    throw new Error("Shopify Customer Account API environment variables are not configured.");
  }

  return { domain, clientId, clientSecret, redirectUri };
}

export function randomToken(bytes = 32) {
  return base64UrlEncode(crypto.randomBytes(bytes));
}

export function createCodeChallenge(verifier: string) {
  return base64UrlEncode(crypto.createHash("sha256").update(verifier).digest());
}

export async function getOpenIdConfiguration(domain: string): Promise<OpenIdConfiguration> {
  const response = await fetch(`https://${domain}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to discover Shopify customer authentication endpoints.");
  }

  return response.json() as Promise<OpenIdConfiguration>;
}

export async function exchangeCustomerAuthorizationCode(code: string, codeVerifier: string): Promise<TokenResponse> {
  const { domain, clientId, clientSecret, redirectUri } = getCustomerAccountConfig();
  const discovery = await getOpenIdConfiguration(domain);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const headers: HeadersInit = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Don Perro Website",
  };

  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const response = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Unable to create a Shopify customer session.");
  }

  return payload as TokenResponse;
}

export async function getCustomerAccountApiConfiguration(domain: string): Promise<CustomerAccountApiConfiguration> {
  const response = await fetch(`https://${domain}/.well-known/customer-account-api`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to discover Shopify Customer Account API endpoint.");
  }

  return response.json() as Promise<CustomerAccountApiConfiguration>;
}

export async function getCustomerAccountUser(accessToken: string): Promise<CustomerAccountUser> {
  const { domain } = getCustomerAccountConfig();
  const apiConfig = await getCustomerAccountApiConfiguration(domain);
  const query = `#graphql
    query CurrentCustomer {
      customer {
        firstName
        lastName
        emailAddress {
          emailAddress
        }
      }
    }
  `;

  const response = await fetch(apiConfig.graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphQLResponse<CustomerQueryResponse>;
  if (!response.ok || hasShopifyErrors(payload.errors) || !payload.data?.customer) {
    const details = formatShopifyErrors(payload.errors) || response.statusText;
    throw new Error(`Unable to load Shopify customer account: ${details}`);
  }

  const customer = payload.data.customer;
  const email = customer.emailAddress?.emailAddress;
  if (!email) {
    throw new Error("Shopify customer account did not include an email address.");
  }

  return {
    firstName: customer.firstName || "Don",
    lastName: customer.lastName || "Perro",
    email,
  };
}

function base64UrlEncode(value: Buffer) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function formatShopifyErrors(errors: unknown) {
  if (!errors) return "";

  if (Array.isArray(errors)) {
    return errors
      .map((error) => {
        if (typeof error === "string") return error;
        if (error && typeof error === "object" && "message" in error) {
          return String(error.message);
        }
        return JSON.stringify(error);
      })
      .join("; ");
  }

  if (typeof errors === "string") return errors;

  if (typeof errors === "object" && "message" in errors) {
    return String(errors.message);
  }

  return JSON.stringify(errors);
}

function hasShopifyErrors(errors: unknown) {
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  return true;
}
