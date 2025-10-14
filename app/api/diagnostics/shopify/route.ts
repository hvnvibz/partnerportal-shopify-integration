import { NextResponse } from "next/server"
import { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_API_ENDPOINT, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_STOREFRONT_API_VERSION } from "@/lib/shopify-constants"

export async function GET() {
  try {
    const maskedToken = SHOPIFY_STOREFRONT_ACCESS_TOKEN
      ? SHOPIFY_STOREFRONT_ACCESS_TOKEN.slice(0, 4) + "***" + SHOPIFY_STOREFRONT_ACCESS_TOKEN.slice(-4)
      : null

    // Try a minimal GraphQL ping without leaking secrets
    let pingStatus: number | null = null
    let pingOk: boolean | null = null
    try {
      const res = await fetch(SHOPIFY_STOREFRONT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
          "Accept": "application/json",
        },
        body: JSON.stringify({ query: "query { shop { name } }" }),
        cache: "no-store",
      })
      pingStatus = res.status
      pingOk = res.ok
    } catch (e) {
      pingStatus = null
      pingOk = false
    }

    return NextResponse.json({
      ok: true,
      env: {
        SHOPIFY_STORE_DOMAIN,
        SHOPIFY_STOREFRONT_API_ENDPOINT,
        SHOPIFY_STOREFRONT_API_VERSION,
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: maskedToken,
        hasToken: Boolean(SHOPIFY_STOREFRONT_ACCESS_TOKEN),
      },
      ping: { status: pingStatus, ok: pingOk },
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 500 })
  }
}


