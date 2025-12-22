type SendEmailInput = {
  to: string
  subject: string
  text: string
  html?: string
}

function getResendApiKey() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Missing RESEND_API_KEY env var')
  return key
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || '9jaDirectory <no-reply@9jadirectory.org>'
}

function textToHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')
}

export async function sendEmail(input: SendEmailInput) {
  const apiKey = getResendApiKey()
  const from = getFromEmail()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? textToHtml(input.text),
    }),
    cache: 'no-store',
  })

  const json = (await res.json()) as { id?: string; message?: string }
  if (!res.ok) {
    throw new Error(json.message || 'Failed to send email')
  }

  return json.id ?? null
}

