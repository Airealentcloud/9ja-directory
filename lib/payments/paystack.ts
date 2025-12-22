type PaystackInitializeResponse = {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: {
    id: number
    status: string
    reference: string
    amount: number
    currency: string
    paid_at?: string
    channel?: string
    customer?: { email?: string }
    metadata?: Record<string, unknown>
  }
}

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    throw new Error('Missing PAYSTACK_SECRET_KEY env var')
  }
  return key
}

export async function initializePaystackTransaction(input: {
  email: string
  amountKobo: number
  reference: string
  callbackUrl: string
  currency?: string
  metadata?: Record<string, unknown>
}) {
  const key = getPaystackSecretKey()
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: input.currency ?? 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    }),
    cache: 'no-store',
  })

  const json = (await res.json()) as PaystackInitializeResponse
  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || 'Failed to initialize Paystack transaction')
  }

  return json.data
}

export async function verifyPaystackTransaction(reference: string) {
  const key = getPaystackSecretKey()
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })

  const json = (await res.json()) as PaystackVerifyResponse
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || 'Failed to verify Paystack transaction')
  }

  return json.data
}

