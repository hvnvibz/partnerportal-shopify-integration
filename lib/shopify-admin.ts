// Shopify Admin API Client
// Handles customer management, order history, and data synchronization

import { SHOPIFY_STORE_DOMAIN } from "./shopify-constants";

// Environment variables
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const SHOPIFY_STORE_URL = `https://${SHOPIFY_STORE_DOMAIN}`;

// Types
export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  verified_email: boolean;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id?: number;
  note?: string;
  tags: string;
  last_order_name?: string;
  currency: string;
  addresses?: ShopifyAddress[];
  default_address?: ShopifyAddress;
}

export interface ShopifyAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  name: string;
  province_code?: string;
  country_code: string;
  country_name: string;
  default: boolean;
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  created_at: string;
  updated_at: string;
  processed_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status?: string;
  line_items: ShopifyLineItem[];
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ShopifyLineItem {
  id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  variant_title?: string;
  vendor?: string;
  fulfillment_service: string;
  product_id: number;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management?: string;
  properties: any[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  total_discount: string;
  fulfillment_status?: string;
  price_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
  total_discount_set: {
    shop_money: {
      amount: string;
      currency_code: string;
    };
    presentment_money: {
      amount: string;
      currency_code: string;
    };
  };
}

export interface CreateCustomerData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  verified_email?: boolean;
  accepts_marketing?: boolean;
  note?: string;
  tags?: string;
  addresses?: Partial<ShopifyAddress>[];
}

export interface UpdateCustomerData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  verified_email?: boolean;
  accepts_marketing?: boolean;
  note?: string;
  tags?: string;
}

// Helper function to make Admin API requests
async function shopifyAdminFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${SHOPIFY_STORE_URL}/admin/api/2024-01/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify Admin API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Customer Management Functions

/**
 * Create a new customer in Shopify
 */
export async function createShopifyCustomer(customerData: CreateCustomerData): Promise<ShopifyCustomer> {
  try {
    const response = await shopifyAdminFetch('customers.json', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerData
      }),
    });

    if (response.errors) {
      throw new Error(`Customer creation failed: ${JSON.stringify(response.errors)}`);
    }

    return response.customer;
  } catch (error) {
    console.error('Error creating Shopify customer:', error);
    throw error;
  }
}

/**
 * Get customer by ID
 */
export async function getShopifyCustomer(customerId: number): Promise<ShopifyCustomer | null> {
  try {
    const response = await shopifyAdminFetch(`customers/${customerId}.json`);
    return response.customer || null;
  } catch (error) {
    console.error('Error fetching Shopify customer:', error);
    return null;
  }
}

/**
 * Get customer by email
 */
export async function getShopifyCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
  try {
    const response = await shopifyAdminFetch(`customers/search.json?query=email:${encodeURIComponent(email)}`);
    
    if (response.customers && response.customers.length > 0) {
      return response.customers[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error searching Shopify customer by email:', error);
    return null;
  }
}

/**
 * Update customer in Shopify
 */
export async function updateShopifyCustomer(customerId: number, customerData: UpdateCustomerData): Promise<ShopifyCustomer> {
  try {
    const response = await shopifyAdminFetch(`customers/${customerId}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        customer: {
          id: customerId,
          ...customerData
        }
      }),
    });

    if (response.errors) {
      throw new Error(`Customer update failed: ${JSON.stringify(response.errors)}`);
    }

    return response.customer;
  } catch (error) {
    console.error('Error updating Shopify customer:', error);
    throw error;
  }
}

/**
 * Get customer orders
 */
export async function getShopifyCustomerOrders(customerId: number, limit: number = 50): Promise<ShopifyOrder[]> {
  try {
    const response = await shopifyAdminFetch(`customers/${customerId}/orders.json?limit=${limit}&status=any`);
    return response.orders || [];
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
}

/**
 * Get all customer addresses
 */
export async function getShopifyCustomerAddresses(customerId: number): Promise<ShopifyAddress[]> {
  try {
    const response = await shopifyAdminFetch(`customers/${customerId}/addresses.json`);
    return response.addresses || [];
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return [];
  }
}

/**
 * Create customer address
 */
export async function createShopifyCustomerAddress(customerId: number, addressData: Partial<ShopifyAddress>): Promise<ShopifyAddress> {
  try {
    const response = await shopifyAdminFetch(`customers/${customerId}/addresses.json`, {
      method: 'POST',
      body: JSON.stringify({
        address: addressData
      }),
    });

    if (response.errors) {
      throw new Error(`Address creation failed: ${JSON.stringify(response.errors)}`);
    }

    return response.customer_address;
  } catch (error) {
    console.error('Error creating customer address:', error);
    throw error;
  }
}

/**
 * Update customer address
 */
export async function updateShopifyCustomerAddress(customerId: number, addressId: number, addressData: Partial<ShopifyAddress>): Promise<ShopifyAddress> {
  try {
    const response = await shopifyAdminFetch(`customers/${customerId}/addresses/${addressId}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        address: {
          id: addressId,
          ...addressData
        }
      }),
    });

    if (response.errors) {
      throw new Error(`Address update failed: ${JSON.stringify(response.errors)}`);
    }

    return response.customer_address;
  } catch (error) {
    console.error('Error updating customer address:', error);
    throw error;
  }
}

/**
 * Delete customer address
 */
export async function deleteShopifyCustomerAddress(customerId: number, addressId: number): Promise<boolean> {
  try {
    await shopifyAdminFetch(`customers/${customerId}/addresses/${addressId}.json`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting customer address:', error);
    return false;
  }
}

/**
 * Set default address for customer
 */
export async function setDefaultShopifyAddress(customerId: number, addressId: number): Promise<boolean> {
  try {
    await shopifyAdminFetch(`customers/${customerId}/addresses/${addressId}/default.json`, {
      method: 'PUT',
    });
    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    return false;
  }
}

// Utility Functions

/**
 * Check if customer exists by email
 */
export async function customerExists(email: string): Promise<boolean> {
  const customer = await getShopifyCustomerByEmail(email);
  return customer !== null;
}

/**
 * Get customer summary for display
 */
export function getCustomerSummary(customer: ShopifyCustomer) {
  return {
    id: customer.id,
    email: customer.email,
    name: `${customer.first_name} ${customer.last_name}`,
    phone: customer.phone,
    ordersCount: customer.orders_count,
    totalSpent: customer.total_spent,
    currency: customer.currency,
    lastOrderDate: customer.last_order_id ? new Date(customer.updated_at) : null,
    verified: customer.verified_email,
    acceptsMarketing: customer.accepts_marketing,
  };
}

/**
 * Format customer data for Supabase
 */
export function formatCustomerForSupabase(customer: ShopifyCustomer) {
  return {
    shopify_customer_id: customer.id,
    phone: customer.phone,
    address: customer.default_address ? {
      company: customer.default_address.company,
      address1: customer.default_address.address1,
      address2: customer.default_address.address2,
      city: customer.default_address.city,
      province: customer.default_address.province,
      country: customer.default_address.country,
      zip: customer.default_address.zip,
      phone: customer.default_address.phone,
    } : null,
    shopify_synced_at: new Date().toISOString(),
  };
}
