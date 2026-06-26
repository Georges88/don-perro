import "server-only";

import crypto from "node:crypto";

export interface CustomerAccountUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface CustomerAccountOrder {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  totalPrice: string;
  itemCount: number;
  title: string;
  imageUrl: string;
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

interface CustomerOrdersQueryResponse {
  customer: {
    orders: {
      nodes: Array<{
        id: string;
        name?: string | null;
        processedAt?: string | null;
        fulfillmentStatus?: string | null;
        financialStatus?: string | null;
        totalPrice?: {
          amount: string;
          currencyCode: string;
        } | null;
        lineItems?: {
          nodes: Array<{
            title?: string | null;
            quantity?: number | null;
            image?: {
              url?: string | null;
            } | null;
          }>;
        } | null;
      }>;
    };
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

export async function getCustomerAccountOrders(accessToken: string): Promise<CustomerAccountOrder[]> {
  const { domain } = getCustomerAccountConfig();
  const apiConfig = await getCustomerAccountApiConfiguration(domain);
  const query = `#graphql
    query CurrentCustomerOrders {
      customer {
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id
            name
            processedAt
            fulfillmentStatus
            financialStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              nodes {
                title
                quantity
                image {
                  url
                }
              }
            }
          }
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

  const payload = (await response.json()) as GraphQLResponse<CustomerOrdersQueryResponse>;
  if (!response.ok || hasShopifyErrors(payload.errors) || !payload.data?.customer) {
    const details = formatShopifyErrors(payload.errors) || response.statusText;
    throw new Error(`Unable to load Shopify customer orders: ${details}`);
  }

  return payload.data.customer.orders.nodes.map((order) => {
    const lineItems = order.lineItems?.nodes || [];
    const firstItem = lineItems[0];
    const itemCount = lineItems.reduce((total, item) => total + (item.quantity || 1), 0);

    return {
      id: order.name || order.id.split("/").pop() || order.id,
      name: order.name || order.id,
      processedAt: order.processedAt || "",
      fulfillmentStatus: order.fulfillmentStatus || "UNFULFILLED",
      financialStatus: order.financialStatus || "PENDING",
      totalPrice: formatMoney(order.totalPrice?.amount, order.totalPrice?.currencyCode),
      itemCount,
      title: firstItem?.title || "Don Perro order",
      imageUrl: firstItem?.image?.url || "/images/product-placeholder.svg",
    };
  });
}

function base64UrlEncode(value: Buffer) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function formatMoney(amount?: string, currencyCode?: string) {
  const numericAmount = Number(amount || 0);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currencyCode || "USD"}`;
  }
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
