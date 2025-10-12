// Customer Data Synchronization between Shopify and Supabase
// Handles bidirectional sync of customer data

import { supabase } from "./supabaseClient";
import { 
  getShopifyCustomer, 
  updateShopifyCustomer, 
  getShopifyCustomerByEmail,
  formatCustomerForSupabase 
} from "./shopify-admin";

// Types
export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface CustomerSyncData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: any;
  verified_email?: boolean;
  accepts_marketing?: boolean;
  tags?: string;
  note?: string;
}

/**
 * Sync customer data from Shopify to Supabase
 */
export async function syncFromShopifyToSupabase(shopifyCustomerId: number): Promise<SyncResult> {
  try {
    // Get customer from Shopify
    const shopifyCustomer = await getShopifyCustomer(shopifyCustomerId);
    if (!shopifyCustomer) {
      return {
        success: false,
        message: "Shopify-Kunde nicht gefunden",
        error: "CUSTOMER_NOT_FOUND"
      };
    }

    // Find Supabase user by Shopify customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('shopify_customer_id', shopifyCustomerId)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: "Supabase-Profil nicht gefunden",
        error: "PROFILE_NOT_FOUND"
      };
    }

    // Format customer data for Supabase
    const supabaseData = formatCustomerForSupabase(shopifyCustomer);

    // Update Supabase profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(supabaseData)
      .eq('id', profile.id);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return {
        success: false,
        message: "Fehler beim Aktualisieren des Supabase-Profils",
        error: updateError.message
      };
    }

    return {
      success: true,
      message: "Kundendaten erfolgreich synchronisiert",
      data: {
        shopify_customer_id: shopifyCustomerId,
        supabase_user_id: profile.id,
        synced_at: new Date().toISOString()
      }
    };

  } catch (error: any) {
    console.error('Sync from Shopify to Supabase error:', error);
    return {
      success: false,
      message: "Synchronisationsfehler",
      error: error.message
    };
  }
}

/**
 * Sync customer data from Supabase to Shopify
 */
export async function syncFromSupabaseToShopify(supabaseUserId: string): Promise<SyncResult> {
  try {
    // Get Supabase user and profile
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(supabaseUserId);
    if (userError || !user) {
      return {
        success: false,
        message: "Supabase-Benutzer nicht gefunden",
        error: "USER_NOT_FOUND"
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('shopify_customer_id, phone, address, shopify_verified, shopify_accepts_marketing, shopify_tags, shopify_note')
      .eq('id', supabaseUserId)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: "Supabase-Profil nicht gefunden",
        error: "PROFILE_NOT_FOUND"
      };
    }

    // Check if Shopify customer exists
    if (!profile.shopify_customer_id) {
      return {
        success: false,
        message: "Keine Shopify-Kunden-ID gefunden",
        error: "NO_SHOPIFY_CUSTOMER_ID"
      };
    }

    // Prepare update data for Shopify
    const updateData: any = {
      first_name: user.user.user_metadata?.first_name || '',
      last_name: user.user.user_metadata?.last_name || '',
    };

    if (profile.phone) updateData.phone = profile.phone;
    if (profile.shopify_verified !== undefined) updateData.verified_email = profile.shopify_verified;
    if (profile.shopify_accepts_marketing !== undefined) updateData.accepts_marketing = profile.shopify_accepts_marketing;
    if (profile.shopify_tags) updateData.tags = profile.shopify_tags;
    if (profile.shopify_note) updateData.note = profile.shopify_note;

    // Update Shopify customer
    const updatedShopifyCustomer = await updateShopifyCustomer(profile.shopify_customer_id, updateData);

    return {
      success: true,
      message: "Kundendaten erfolgreich zu Shopify synchronisiert",
      data: {
        shopify_customer_id: profile.shopify_customer_id,
        supabase_user_id: supabaseUserId,
        synced_at: new Date().toISOString()
      }
    };

  } catch (error: any) {
    console.error('Sync from Supabase to Shopify error:', error);
    return {
      success: false,
      message: "Synchronisationsfehler",
      error: error.message
    };
  }
}

/**
 * Find and sync customer by email
 */
export async function syncCustomerByEmail(email: string): Promise<SyncResult> {
  try {
    // Get Shopify customer by email
    const shopifyCustomer = await getShopifyCustomerByEmail(email);
    if (!shopifyCustomer) {
      return {
        success: false,
        message: "Shopify-Kunde mit dieser E-Mail nicht gefunden",
        error: "CUSTOMER_NOT_FOUND"
      };
    }

    // Sync to Supabase
    return await syncFromShopifyToSupabase(shopifyCustomer.id);

  } catch (error: any) {
    console.error('Sync customer by email error:', error);
    return {
      success: false,
      message: "Synchronisationsfehler",
      error: error.message
    };
  }
}

/**
 * Get sync status for a user
 */
export async function getSyncStatus(supabaseUserId: string): Promise<SyncResult> {
  try {
    const { data, error } = await supabase
      .rpc('get_customer_sync_status', { p_user_id: supabaseUserId });

    if (error) {
      return {
        success: false,
        message: "Fehler beim Abrufen des Sync-Status",
        error: error.message
      };
    }

    return {
      success: true,
      message: "Sync-Status erfolgreich abgerufen",
      data: data[0] || null
    };

  } catch (error: any) {
    console.error('Get sync status error:', error);
    return {
      success: false,
      message: "Fehler beim Abrufen des Sync-Status",
      error: error.message
    };
  }
}

/**
 * Get customers that need synchronization
 */
export async function getCustomersNeedingSync(hoursThreshold: number = 24): Promise<SyncResult> {
  try {
    const { data, error } = await supabase
      .rpc('get_customers_needing_sync', { p_hours_threshold: hoursThreshold });

    if (error) {
      return {
        success: false,
        message: "Fehler beim Abrufen der Kundenliste",
        error: error.message
      };
    }

    return {
      success: true,
      message: "Kundenliste erfolgreich abgerufen",
      data: data || []
    };

  } catch (error: any) {
    console.error('Get customers needing sync error:', error);
    return {
      success: false,
      message: "Fehler beim Abrufen der Kundenliste",
      error: error.message
    };
  }
}

/**
 * Batch sync multiple customers
 */
export async function batchSyncCustomers(customerIds: number[]): Promise<SyncResult> {
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const customerId of customerIds) {
    try {
      const result = await syncFromShopifyToSupabase(customerId);
      results.push({ customerId, ...result });
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error: any) {
      results.push({
        customerId,
        success: false,
        message: "Synchronisationsfehler",
        error: error.message
      });
      errorCount++;
    }
  }

  return {
    success: errorCount === 0,
    message: `Batch-Sync abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`,
    data: {
      total: customerIds.length,
      successful: successCount,
      errors: errorCount,
      results
    }
  };
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    const computedSignature = hmac.digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(computedSignature, 'base64')
    );
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
}

/**
 * Process Shopify webhook event
 */
export async function processShopifyWebhook(eventType: string, customerData: any): Promise<SyncResult> {
  try {
    switch (eventType) {
      case 'customers/create':
      case 'customers/update':
        if (customerData.id) {
          return await syncFromShopifyToSupabase(customerData.id);
        }
        break;
      
      case 'customers/delete':
        // Handle customer deletion if needed
        return {
          success: true,
          message: "Kunde gelöscht - keine Aktion erforderlich"
        };
      
      default:
        return {
          success: false,
          message: "Unbekannter Event-Typ",
          error: "UNKNOWN_EVENT_TYPE"
        };
    }

    return {
      success: false,
      message: "Keine gültigen Kundendaten gefunden",
      error: "INVALID_CUSTOMER_DATA"
    };

  } catch (error: any) {
    console.error('Process webhook error:', error);
    return {
      success: false,
      message: "Webhook-Verarbeitungsfehler",
      error: error.message
    };
  }
}
