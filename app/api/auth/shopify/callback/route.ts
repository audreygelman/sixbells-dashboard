import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const shop = process.env.SHOPIFY_STORE
  const clientId = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

  if (!code) {
    return NextResponse.json({ error: 'No code in callback' }, { status: 400 })
  }

  if (!shop || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing Shopify env vars' }, { status: 500 })
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })

  const data = await response.json() as { access_token?: string; error?: string }

  if (!data.access_token) {
    return NextResponse.json({ error: 'Failed to get access token', detail: data }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    message: 'Copy the access_token below into your .env.local as SHOPIFY_ACCESS_TOKEN',
    access_token: data.access_token,
  })
}
