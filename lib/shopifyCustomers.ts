import "server-only";

export interface CreateShopifyCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
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
    userErrors: ShopifyUserError[];
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation CreateDonPerroCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function getShopifyAdminConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2026-04";

  if (!domain || !token) {
    throw new Error("Shopify Admin API environment variables are not configured.");
  }

  return { domain, token, version };
}

export async function createShopifyCustomer(input: CreateShopifyCustomerInput): Promise<ShopifyCustomer> {
  const { domain, token, version } = getShopifyAdminConfig();
  const tags = ["don-perro-web-customer"];

  if (input.petPreference) {
    tags.push(`pet-preference-${input.petPreference}`);
  }

  const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      query: CUSTOMER_CREATE_MUTATION,
      variables: {
        input: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          tags,
        },
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphQLResponse<CustomerCreateResponse>;
  if (!response.ok || payload.errors?.length || !payload.data) {
    const details = payload.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`Shopify customer creation failed: ${details}`);
  }

  const result = payload.data.customerCreate;
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((error) => error.message).join(" "));
  }

  if (!result.customer) {
    throw new Error("Shopify did not return a created customer.");
  }

  return result.customer;
}
