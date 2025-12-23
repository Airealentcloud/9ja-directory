// Paystack API helper functions

function getPaystackSecretKey() {
    const key = process.env.PAYSTACK_SECRET_KEY
    if (!key) {
        throw new Error(
            'Payments are not configured (missing PAYSTACK_SECRET_KEY). Set it in your deployment environment variables and redeploy.'
        )
    }
    return key
}
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export interface PaystackInitializeResponse {
    status: boolean
    message: string
    data: {
        authorization_url: string
        access_code: string
        reference: string
    }
}

export interface PaystackVerifyResponse {
    status: boolean
    message: string
    data: {
        id: number
        domain: string
        status: 'success' | 'failed' | 'abandoned'
        reference: string
        amount: number
        message: string | null
        gateway_response: string
        paid_at: string
        created_at: string
        channel: string
        currency: string
        ip_address: string
        metadata: {
            plan_id?: string
            user_id?: string
            listing_id?: string
            custom_fields?: Array<{
                display_name: string
                variable_name: string
                value: string
            }>
        }
        customer: {
            id: number
            first_name: string | null
            last_name: string | null
            email: string
            customer_code: string
            phone: string | null
        }
        authorization: {
            authorization_code: string
            bin: string
            last4: string
            exp_month: string
            exp_year: string
            channel: string
            card_type: string
            bank: string
            country_code: string
            brand: string
            reusable: boolean
            signature: string
        }
    }
}

export interface InitializePaymentParams {
    email: string
    amount: number // in kobo (Naira * 100)
    reference?: string
    callback_url?: string
    metadata?: {
        plan_id: string
        user_id: string
        listing_id?: string
        custom_fields?: Array<{
            display_name: string
            variable_name: string
            value: string
        }>
    }
    channels?: string[]
}

// Generate unique payment reference
export function generateReference(): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `9JD-${timestamp}-${randomStr}`.toUpperCase()
}

// Initialize a payment transaction
export async function initializePayment(params: InitializePaymentParams): Promise<PaystackInitializeResponse> {
    const PAYSTACK_SECRET_KEY = getPaystackSecretKey()
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            reference: params.reference || generateReference(),
            callback_url: params.callback_url,
            metadata: params.metadata,
            channels: params.channels || ['card', 'bank', 'ussd', 'bank_transfer'],
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to initialize payment')
    }

    return response.json()
}

// Verify a payment transaction
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    const PAYSTACK_SECRET_KEY = getPaystackSecretKey()
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to verify payment')
    }

    return response.json()
}

// Create a subscription plan (for recurring payments)
export async function createPlan(params: {
    name: string
    interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annually'
    amount: number // in kobo
}): Promise<{ status: boolean; data: { plan_code: string } }> {
    const PAYSTACK_SECRET_KEY = getPaystackSecretKey()
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create plan')
    }

    return response.json()
}

// Create a subscription for a customer
export async function createSubscription(params: {
    customer: string // customer email or code
    plan: string // plan code
    authorization?: string // authorization code for automatic charge
}): Promise<{ status: boolean; data: { subscription_code: string } }> {
    const PAYSTACK_SECRET_KEY = getPaystackSecretKey()
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create subscription')
    }

    return response.json()
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
    const PAYSTACK_SECRET_KEY = getPaystackSecretKey()
    const crypto = require('crypto')
    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest('hex')
    return hash === signature
}

// Get list of banks for bank transfer
export async function getBanks(): Promise<{ status: boolean; data: Array<{ name: string; code: string }> }> {
    const PAYSTACK_SECRET_KEY = getPaystackSecretKey()
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch banks')
    }

    return response.json()
}
