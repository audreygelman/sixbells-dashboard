import { NextResponse } from 'next/server'

export async function GET() {
  const shop = process.env.SHOPIFY_STORE
  const clientId = process.env.SHOPIFY_CLIENT_ID

  if (!shop || !clientId) {
    return NextResponse.json({ error: 'SHOPIFY_STORE and SHOPIFY_CLIENT_ID must be set in .env.local' }, { status: 500 })
  }

  const redirectUri = 'http://localhost:3000/api/auth/shopify/callback'
  const scopes = 'read_orders'
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`

  return NextResponse.redirect(authUrl)
}
