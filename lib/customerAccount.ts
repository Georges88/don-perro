import "server-only";

import crypto from "node:crypto";

export interface CustomerAccountUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CustomerAccountProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
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
  lineItems: CustomerAccountOrderLineItem[];
}

export interface CustomerAccountOrderLineItem {
  title: string;
  quantity: number;
  merchandiseId: string;
  variantTitle: string;
  price: string;
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
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: {
      emailAddress?: string | null;
    } | null;
    metafield?: {
      value?: string | null;
    } | null;
  } | null;
}

interface CustomerUpdateResponse {
  customerUpdate: {
    customer: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      emailAddress?: {
        emailAddress?: string | null;
      } | null;
    } | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
}

interface MetafieldsSetResponse {
  metafieldsSet: {
    metafields: Array<{
      namespace: string;
      key: string;
      value: string;
    }> | null;
    userErrors: Array<{ field?: string[] | null; message: string }>;
  };
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
            price?: {
              amount: string;
              currencyCode: string;
            } | null;
            image?: {
              url?: string | null;
            } | null;
            merchandise?: {
              id?: string | null;
              title?: string | null;
              product?: {
                id: string;
                title: string;
                handle: string;
                description: string;
                vendor: string;
                productType: string;
                tags: string[];
                featuredImage?: {
                  url?: string | null;
                  altText?: string | null;
                } | null;
              };
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
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        metafield(namespace: "custom", key: "phone") {
          value
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
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    email,
    phone: customer.metafield?.value || "",
  };
}

export async function updateCustomerAccountProfile(
  accessToken: string,
  input: CustomerAccountProfileInput,
): Promise<CustomerAccountUser> {
  const { domain } = getCustomerAccountConfig();
  const apiConfig = await getCustomerAccountApiConfiguration(domain);
  const mutation = `#graphql
    mutation UpdateCustomerProfile($input: CustomerUpdateInput!) {
      customerUpdate(input: $input) {
        userErrors {
          field
          message
        }
        customer {
          id
          firstName
          lastName
          emailAddress {
            emailAddress
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
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          firstName: input.firstName,
          lastName: input.lastName,
        },
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphQLResponse<CustomerUpdateResponse>;
  if (!response.ok || hasShopifyErrors(payload.errors) || !payload.data?.customerUpdate) {
    const details = formatShopifyErrors(payload.errors) || response.statusText;
    throw new Error(`Unable to update Shopify customer profile: ${details}`);
  }

  const result = payload.data.customerUpdate;
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((error) => error.message).join(" "));
  }

  const customer = result.customer;
  const email = customer?.emailAddress?.emailAddress;
  if (!customer || !email) {
    throw new Error("Shopify did not return the updated customer profile.");
  }

  await saveCustomerPhoneMetafield(apiConfig.graphql_api, accessToken, customer.id, input.phone);

  return {
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    email,
    phone: input.phone,
  };
}

async function saveCustomerPhoneMetafield(
  graphqlApi: string,
  accessToken: string,
  customerId: string,
  phone: string,
) {
  const mutation = `#graphql
    mutation SaveCustomerPhone($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(graphqlApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        metafields: [
          {
            ownerId: customerId,
            namespace: "custom",
            key: "phone",
            type: "single_line_text_field",
            value: phone,
          },
        ],
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphQLResponse<MetafieldsSetResponse>;
  if (!response.ok || hasShopifyErrors(payload.errors) || !payload.data?.metafieldsSet) {
    const details = formatShopifyErrors(payload.errors) || response.statusText;
    throw new Error(`Unable to save customer phone number: ${details}`);
  }

  const result = payload.data.metafieldsSet;
  if (result.userErrors.length) {
    const message = result.userErrors.map((error) => error.message).join(" ");
    if (message.toLowerCase().includes("access to this namespace and key")) {
      throw new Error(
        "Shopify is not allowing this app to save custom.phone yet. Enable Customer Account API read/write access on the customer metafield definition, save it, then try again.",
      );
    }
    throw new Error(message);
  }
}

export async function getCustomerAccountOrders(accessToken: string): Promise<CustomerAccountOrder[]> {
  const { domain } = getCustomerAccountConfig();
  const apiConfig = await getCustomerAccountApiConfiguration(domain);
  const detailedQuery = `#graphql
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
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    availableForSale
                    product {
                      id
                      title
                      handle
                      description
                      vendor
                      productType
                      tags
                      featuredImage {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const minimalQuery = `#graphql
    query CurrentCustomerOrdersFallback {
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
          }
        }
      }
    }
  `;

  try {
    const payload = await fetchCustomerAccountOrders(apiConfig.graphql_api, accessToken, detailedQuery);
    return mapCustomerOrders(payload);
  } catch (error) {
    console.warn("Falling back to minimal Customer Account orders query", error);
    const payload = await fetchCustomerAccountOrders(apiConfig.graphql_api, accessToken, minimalQuery);
    return mapCustomerOrders(payload);
  }
}

async function fetchCustomerAccountOrders(graphqlApi: string, accessToken: string, query: string) {
  const response = await fetch(graphqlApi, {
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

  return payload;
}

function mapCustomerOrders(payload: GraphQLResponse<CustomerOrdersQueryResponse>): CustomerAccountOrder[] {
  if (!payload.data?.customer) return [];

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
      lineItems: lineItems.map((item) => {
        const merchandise = "merchandise" in item ? item.merchandise : null;
        const product = merchandise && "product" in merchandise ? merchandise.product : null;
        const imageUrl = item.image?.url || product?.featuredImage?.url || "/images/product-placeholder.svg";

        return {
          title: item.title || product?.title || "Don Perro product",
          quantity: item.quantity || 1,
          merchandiseId: merchandise && "id" in merchandise ? merchandise.id : "",
          variantTitle: merchandise && "title" in merchandise ? merchandise.title : "Default",
          price: formatMoney(item.price?.amount, item.price?.currencyCode),
          imageUrl,
        };
      }).filter((item) => item.merchandiseId),
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
