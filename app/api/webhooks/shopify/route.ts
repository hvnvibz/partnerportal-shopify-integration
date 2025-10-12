import { NextResponse } from "next/server";
import { processShopifyWebhook, validateWebhookSignature } from "@/lib/sync-customer-data";

// Environment variables
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    // Get webhook signature from headers
    const signature = req.headers.get('x-shopify-hmac-sha256');
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Get webhook topic from headers
    const topic = req.headers.get('x-shopify-topic');
    if (!topic) {
      console.error('Missing webhook topic');
      return NextResponse.json(
        { error: "Missing topic" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.text();
    
    // Validate webhook signature
    if (!validateWebhookSignature(body, signature, SHOPIFY_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse customer data
    let customerData;
    try {
      customerData = JSON.parse(body);
    } catch (parseError) {
      console.error('Error parsing webhook body:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // Log webhook for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`Shopify webhook received: ${topic}`, {
        customerId: customerData.id,
        email: customerData.email,
        timestamp: new Date().toISOString()
      });
    }

    // Process the webhook
    const result = await processShopifyWebhook(topic, customerData);

    if (result.success) {
      console.log(`Webhook processed successfully: ${topic}`, result.message);
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      console.error(`Webhook processing failed: ${topic}`, result.error);
      return NextResponse.json(
        { 
          error: result.message,
          details: result.error 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification (if needed)
export async function GET(req: Request) {
  return NextResponse.json({
    message: "Shopify webhook endpoint is active",
    timestamp: new Date().toISOString()
  });
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-shopify-hmac-sha256, x-shopify-topic',
    },
  });
}
