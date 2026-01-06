// Shopify Admin API Client
// Handles customer management, order history, and data synchronization

// Helper function to get store domain (reads from env at runtime)
function getShopifyStoreDomain(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  if (!domain) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set');
  }
  return domain;
}

// Helper function to get store URL (reads from env at runtime)
function getShopifyStoreUrl(): string {
  return `https://${getShopifyStoreDomain()}`;
}

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

// Helper function to get access token (reads from env at runtime)
function getShopifyAccessToken(): string {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not set');
  }
  return token;
}

// Helper function to make Admin API requests
async function shopifyAdminFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${getShopifyStoreUrl()}/admin/api/2024-01/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': getShopifyAccessToken(),
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
 * Get all customers from Shopify (with pagination)
 * Note: This function handles pagination automatically using Shopify's cursor-based pagination
 */
export async function getAllShopifyCustomers(): Promise<ShopifyCustomer[]> {
  const allCustomers: ShopifyCustomer[] = [];
  let pageInfo: string | null = null;
  let hasNextPage = true;
  let pageCount = 0;

  try {
    while (hasNextPage) {
      pageCount++;
      let endpoint = 'customers.json?limit=250';
      if (pageInfo) {
        endpoint += `&page_info=${encodeURIComponent(pageInfo)}`;
      }

      // We need to use fetch directly to access response headers
      const url = `${getShopifyStoreUrl()}/admin/api/2024-01/${endpoint}`;
      const token = getShopifyAccessToken();
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify Admin API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.customers && data.customers.length > 0) {
        allCustomers.push(...data.customers);
        console.log(`   Seite ${pageCount}: ${data.customers.length} Kunden geladen (Gesamt: ${allCustomers.length})`);
      }

      // Check for pagination in Link header
      const linkHeader = response.headers.get('link') || '';
      const nextPageMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>; rel="next"/);
      
      if (nextPageMatch && data.customers && data.customers.length === 250) {
        pageInfo = decodeURIComponent(nextPageMatch[1]);
        hasNextPage = true;
      } else {
        hasNextPage = false;
      }

      // Rate limiting: Wait 500ms between requests (Shopify allows 2 req/sec)
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return allCustomers;
  } catch (error) {
    console.error('Error fetching all Shopify customers:', error);
    throw error;
  }
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
    shopify_verified: customer.verified_email,
    shopify_accepts_marketing: customer.accepts_marketing,
    shopify_tags: customer.tags,
    shopify_note: customer.note,
    shopify_synced_at: new Date().toISOString(),
  };
}

// =============================================================================
// Product Search Functions (Admin API)
// =============================================================================

/**
 * Product type returned by Admin API search
 * Compatible with Storefront API format for seamless integration
 */
export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: {
    url: string;
    altText: string;
  } | null;
  availableForSale: boolean;
  productType: string;
  tags: string[];
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  sku: string;
  hide_from_listing?: boolean;
}

/**
 * Search products via Admin API - supports SKU search
 * This function searches products by title and SKU using the Admin API
 * 
 * @param query - Search query (can be title, SKU, or partial match)
 * @param limit - Maximum number of results (default: 50)
 * @returns Array of products in Storefront-compatible format
 */
export async function searchProductsAdmin(query: string, limit: number = 50): Promise<AdminProduct[]> {
  try {
    // Admin API supports searching in title
    // For SKU search, we need to fetch products and filter by variant SKU
    const response = await shopifyAdminFetch(
      `products.json?limit=${limit}&status=active`
    );

    if (!response.products || response.products.length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Filter products that match the query in title or any variant SKU
    const matchingProducts = response.products.filter((product: any) => {
      // Check title match
      const titleMatch = product.title?.toLowerCase().includes(normalizedQuery);
      
      // Check SKU match in any variant
      const skuMatch = product.variants?.some((variant: any) => 
        variant.sku?.toLowerCase().includes(normalizedQuery)
      );

      // Check tags match
      const tagsMatch = product.tags?.toLowerCase().includes(normalizedQuery);

      return titleMatch || skuMatch || tagsMatch;
    });

    // Transform to Storefront-compatible format
    return matchingProducts.map((product: any) => {
      const firstVariant = product.variants?.[0];
      const price = firstVariant?.price || '0';
      const compareAtPrice = firstVariant?.compare_at_price;
      
      return {
        id: `gid://shopify/Product/${product.id}`,
        title: product.title,
        handle: product.handle,
        description: product.body_html?.replace(/<[^>]*>/g, '') || '',
        featuredImage: product.image ? {
          url: product.image.src,
          altText: product.image.alt || product.title,
        } : null,
        availableForSale: product.status === 'active',
        productType: product.product_type || '',
        tags: product.tags?.split(', ').filter(Boolean) || [],
        price: {
          amount: price,
          currencyCode: 'EUR',
        },
        compareAtPrice: compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) ? {
          amount: compareAtPrice,
          currencyCode: 'EUR',
        } : null,
        sku: firstVariant?.sku || '',
        hide_from_listing: false,
      };
    });
  } catch (error) {
    console.error('Error searching products via Admin API:', error);
    return [];
  }
}

/**
 * Search products with pagination support via Admin API
 * Searches ALL products in title, SKU, and tags - not just the first page!
 * 
 * @param query - Search query
 * @param options - Pagination and sorting options
 */
export async function searchProductsAdminPaginated(
  query: string,
  options: {
    limit?: number;
    page?: number; // Page number for client-side pagination of filtered results
    sortKey?: string;
    reverse?: boolean;
  } = {}
): Promise<{
  products: AdminProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
  totalCount: number;
}> {
  const { limit = 24, page = 1, sortKey = 'title', reverse = false } = options;
  
  try {
    // Fetch ALL products from Admin API (with pagination through all pages)
    const allProducts = await fetchAllProductsAdmin();
    
    if (allProducts.length === 0) {
      return { products: [], hasNextPage: false, endCursor: null, totalCount: 0 };
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Filter products that match the query in title, SKU, or tags
    const matchingProducts = allProducts.filter((product: any) => {
      const titleMatch = product.title?.toLowerCase().includes(normalizedQuery);
      const skuMatch = product.variants?.some((variant: any) => 
        variant.sku?.toLowerCase().includes(normalizedQuery)
      );
      const tagsMatch = product.tags?.toLowerCase().includes(normalizedQuery);
      return titleMatch || skuMatch || tagsMatch;
    });

    // Sort products
    const sortedProducts = [...matchingProducts].sort((a: any, b: any) => {
      let comparison = 0;
      switch (sortKey.toUpperCase()) {
        case 'TITLE':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'PRICE':
          const priceA = parseFloat(a.variants?.[0]?.price || '0');
          const priceB = parseFloat(b.variants?.[0]?.price || '0');
          comparison = priceA - priceB;
          break;
        case 'CREATED_AT':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'BEST_SELLING':
          // Shopify doesn't provide sales data via REST API, fallback to title
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        default:
          comparison = (a.title || '').localeCompare(b.title || '');
      }
      return reverse ? -comparison : comparison;
    });

    // Client-side pagination of filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
    const hasNextPage = endIndex < sortedProducts.length;

    // Transform to Storefront-compatible format
    const products: AdminProduct[] = paginatedProducts.map((product: any) => 
      transformAdminProduct(product)
    );

    return {
      products,
      hasNextPage,
      endCursor: hasNextPage ? String(page + 1) : null, // Use page number as cursor
      totalCount: sortedProducts.length,
    };
  } catch (error) {
    console.error('Error searching products via Admin API:', error);
    return { products: [], hasNextPage: false, endCursor: null, totalCount: 0 };
  }
}

/**
 * Fetch ALL products from Shopify Admin API (handles pagination automatically)
 * Caches results for 5 minutes to avoid excessive API calls
 */
let productsCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchAllProductsAdmin(): Promise<any[]> {
  // Check cache first
  if (productsCache && Date.now() - productsCache.timestamp < CACHE_TTL) {
    console.log(`[Admin API] Using cached products (${productsCache.data.length} products)`);
    return productsCache.data;
  }

  const allProducts: any[] = [];
  let pageInfo: string | null = null;
  let hasNextPage = true;
  let pageCount = 0;

  console.log('[Admin API] Fetching all products for search...');

  while (hasNextPage) {
    pageCount++;
    let endpoint = 'products.json?limit=250&status=active';
    if (pageInfo) {
      endpoint = `products.json?limit=250&page_info=${encodeURIComponent(pageInfo)}`;
    }

    const url = `${getShopifyStoreUrl()}/admin/api/2024-01/${endpoint}`;
    const token = getShopifyAccessToken();
    
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify Admin API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      allProducts.push(...data.products);
      console.log(`[Admin API] Page ${pageCount}: ${data.products.length} products (Total: ${allProducts.length})`);
    }

    // Check for pagination in Link header
    const linkHeader = response.headers.get('link') || '';
    const nextPageMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>; rel="next"/);
    
    if (nextPageMatch && data.products && data.products.length === 250) {
      pageInfo = decodeURIComponent(nextPageMatch[1]);
      hasNextPage = true;
      // Rate limiting: Wait 500ms between requests (Shopify allows 2 req/sec)
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      hasNextPage = false;
    }
  }

  console.log(`[Admin API] Total products fetched: ${allProducts.length}`);

  // Update cache
  productsCache = { data: allProducts, timestamp: Date.now() };

  return allProducts;
}

/**
 * Transform Admin API product to Storefront-compatible format
 */
function transformAdminProduct(product: any): AdminProduct {
  const firstVariant = product.variants?.[0];
  const price = firstVariant?.price || '0';
  const compareAtPrice = firstVariant?.compare_at_price;
  
  return {
    id: `gid://shopify/Product/${product.id}`,
    title: product.title,
    handle: product.handle,
    description: product.body_html?.replace(/<[^>]*>/g, '') || '',
    featuredImage: product.image ? {
      url: product.image.src,
      altText: product.image.alt || product.title,
    } : null,
    availableForSale: product.status === 'active',
    productType: product.product_type || '',
    tags: product.tags?.split(', ').filter(Boolean) || [],
    price: {
      amount: price,
      currencyCode: 'EUR',
    },
    compareAtPrice: compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) ? {
      amount: compareAtPrice,
      currencyCode: 'EUR',
    } : null,
    sku: firstVariant?.sku || '',
    hide_from_listing: false,
  };
}

/**
 * Clear the products cache (useful after product updates)
 */
export function clearProductsCache(): void {
  productsCache = null;
  console.log('[Admin API] Products cache cleared');
}
