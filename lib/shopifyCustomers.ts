import "server-only";

export interface CreateShopifyCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  petPreference?: "dog" | "cat" | "multiple" | null;
}

export interface ShopifyCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface ShopifyUserError {
  field?: string[] | null;
  message: string;
}

interface CustomerCreateResponse {
  customerCreate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: ShopifyUserError[];
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: unknown;
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation CreateDonPerroCustomer($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

function getShopifyStorefrontConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2026-04";

  if (!domain || !token) {
    throw new Error("Shopify Storefront API environment variables are not configured.");
  }

  return { domain, token, version };
}

export async function createShopifyCustomer(input: CreateShopifyCustomerInput): Promise<ShopifyCustomer> {
  const { domain, token, version } = getShopifyStorefrontConfig();

  const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({
      query: CUSTOMER_CREATE_MUTATION,
      variables: {
        input: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: input.password,
        },
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphQLResponse<CustomerCreateResponse>;
  if (!response.ok || hasShopifyErrors(payload.errors) || !payload.data) {
    const details = formatShopifyErrors(payload.errors) || response.statusText;
    throw new Error(`Shopify customer creation failed: ${details}`);
  }

  const result = payload.data.customerCreate;
  if (Array.isArray(result.customerUserErrors) && result.customerUserErrors.length) {
    throw new Error(result.customerUserErrors.map((error) => error.message).join(" "));
  }

  if (!result.customer) {
    throw new Error("Shopify did not return a created customer.");
  }

  return result.customer;
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
