import { POST as paystackWebhookPost } from '@/app/api/paystack/webhook/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = paystackWebhookPost
