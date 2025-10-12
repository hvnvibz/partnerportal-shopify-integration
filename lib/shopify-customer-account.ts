// Shopify Customer Account API Integration
// Alternative to Multipass for non-Plus plans

import { SHOPIFY_STORE_DOMAIN } from "./shopify-constants";

// Environment variables
const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!;
const SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET!;

// Types
export interface CustomerAccountData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  accepts_marketing?: boolean;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  company?: string;
}

export interface CustomerAccountResponse {
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    acceptsMarketing: boolean;
    createdAt: string;
    updatedAt: string;
  };
  customerAccessToken: {
    accessToken: string;
    expiresAt: string;
  };
}

/**
 * Create customer account using Customer Account API
 */
export async function createCustomerAccount(customerData: CustomerAccountData): Promise<CustomerAccountResponse> {
  try {
    const mutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            phone
            acceptsMarketing
            createdAt
            updatedAt
          }
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        phone: customerData.phone,
        acceptsMarketing: customerData.accepts_marketing || false,
        addresses: customerData.addresses?.map(addr => ({
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          province: addr.province,
          country: addr.country,
          zip: addr.zip,
          phone: addr.phone,
          company: addr.company,
        })) || [],
      }
    };

    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/account/customer/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Customer-Access-Token': '', // Empty for new customer creation
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Customer Account API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (data.data.customerCreate.customerUserErrors.length > 0) {
      throw new Error(`Customer creation errors: ${JSON.stringify(data.data.customerCreate.customerUserErrors)}`);
    }

    return data.data.customerCreate;
  } catch (error) {
    console.error('Error creating customer account:', error);
    throw error;
  }
}

/**
 * Generate checkout URL with customer pre-fill
 */
export function generateCheckoutUrlWithCustomer(
  customerId: string,
  customerAccessToken: string,
  cartUrl?: string
): string {
  const baseUrl = `https://${SHOPIFY_STORE_DOMAIN}/checkout`;
  const params = new URLSearchParams({
    customer_id: customerId,
    customer_access_token: customerAccessToken,
  });

  if (cartUrl) {
    params.append('return_url', cartUrl);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate customer login URL for Shopify
 */
export function generateCustomerLoginUrl(returnUrl?: string): string {
  const baseUrl = `https://${SHOPIFY_STORE_DOMAIN}/account/login`;
  const params = new URLSearchParams();

  if (returnUrl) {
    params.append('return_url', returnUrl);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate customer registration URL for Shopify
 */
export function generateCustomerRegisterUrl(returnUrl?: string): string {
  const baseUrl = `https://${SHOPIFY_STORE_DOMAIN}/account/register`;
  const params = new URLSearchParams();

  if (returnUrl) {
    params.append('return_url', returnUrl);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Check if Customer Account API is available
 */
export function isCustomerAccountApiAvailable(): boolean {
  return !!(SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID && SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET);
}

/**
 * Alternative approach: Direct checkout with customer data pre-fill
 */
export function generateDirectCheckoutUrl(customerData: CustomerAccountData): string {
  const baseUrl = `https://${SHOPIFY_STORE_DOMAIN}/checkout`;
  const params = new URLSearchParams({
    email: customerData.email,
    first_name: customerData.first_name,
    last_name: customerData.last_name,
  });

  if (customerData.phone) {
    params.append('phone', customerData.phone);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get customer account status
 */
export async function getCustomerAccountStatus(customerId: string, accessToken: string): Promise<any> {
  try {
    const query = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          email
          firstName
          lastName
          phone
          acceptsMarketing
          createdAt
          updatedAt
          addresses(first: 10) {
            edges {
              node {
                id
                address1
                address2
                city
                province
                country
                zip
                phone
                company
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/account/customer/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Customer-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: { customerAccessToken: accessToken },
      }),
    });

    if (!response.ok) {
      throw new Error(`Customer Account API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data.customer;
  } catch (error) {
    console.error('Error getting customer account status:', error);
    throw error;
  }
}

/**
 * Update customer account
 */
export async function updateCustomerAccount(
  customerId: string,
  accessToken: string,
  updates: Partial<CustomerAccountData>
): Promise<any> {
  try {
    const mutation = `
      mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            id
            email
            firstName
            lastName
            phone
            acceptsMarketing
            updatedAt
          }
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      customerAccessToken: accessToken,
      customer: {
        firstName: updates.first_name,
        lastName: updates.last_name,
        phone: updates.phone,
        acceptsMarketing: updates.accepts_marketing,
      }
    };

    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/account/customer/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Customer-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Customer Account API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (data.data.customerUpdate.customerUserErrors.length > 0) {
      throw new Error(`Customer update errors: ${JSON.stringify(data.data.customerUpdate.customerUserErrors)}`);
    }

    return data.data.customerUpdate;
  } catch (error) {
    console.error('Error updating customer account:', error);
    throw error;
  }
}
