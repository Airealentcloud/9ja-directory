import { sendEmail } from './resend'

// Admin email - replace with your actual admin email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@9jadirectory.org'

interface UserSignupData {
    email: string
    fullName?: string
    signupDate: Date
}

interface NewListingData {
    listingId: string
    businessName: string
    ownerEmail: string
    ownerName?: string
    city?: string
    category?: string
    submittedAt: Date
}

interface ListingApprovedData {
    businessName: string
    ownerEmail: string
    ownerName?: string
    listingUrl: string
}

interface ListingRejectedData {
    businessName: string
    ownerEmail: string
    ownerName?: string
    rejectionReason: string
}

interface ContactFormData {
    name: string
    email: string
    subject: string
    message: string
}

interface NewsletterVerificationData {
    email: string
    verificationToken: string
}

interface NewsletterWelcomeData {
    email: string
}

interface NewsletterUnsubscribeData {
    email: string
}

// Send email to admin when new user signs up
export async function notifyAdminNewSignup(data: UserSignupData) {
    const subject = `New User Signup - ${data.email}`

    const text = `
Hello Admin,

A new user has signed up on 9jaDirectory!

User Details:
- Email: ${data.email}
- Name: ${data.fullName || 'Not provided'}
- Signup Date: ${data.signupDate.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}

You can view all users in your admin dashboard.

Best regards,
9jaDirectory System
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #16a34a; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New User Signup</h1>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>A new user has signed up on 9jaDirectory!</p>

            <div class="info-box">
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Name:</strong> ${data.fullName || 'Not provided'}</p>
                <p><strong>Signup Date:</strong> ${data.signupDate.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</p>
            </div>

            <p>You can view all users in your admin dashboard.</p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: ADMIN_EMAIL, subject, text, html })
        console.log('Admin notified of new signup:', data.email)
        return true
    } catch (error) {
        console.error('Failed to notify admin of new signup:', error)
        return false
    }
}

// Send email to admin when new listing is submitted
export async function notifyAdminNewListing(data: NewListingData) {
    const subject = `New Listing Pending - ${data.businessName}`

    const text = `
Hello Admin,

A new business listing has been submitted and is awaiting your approval!

Business Details:
- Business Name: ${data.businessName}
- Owner Email: ${data.ownerEmail}
- Owner Name: ${data.ownerName || 'Not provided'}
- City: ${data.city || 'Not specified'}
- Category: ${data.category || 'Not specified'}
- Submitted: ${data.submittedAt.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}

Please review this listing in your admin dashboard:
https://9jadirectory.org/admin/listings

Best regards,
9jaDirectory System
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        .btn { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Listing Pending Approval</h1>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>A new business listing has been submitted and is awaiting your approval!</p>

            <div class="info-box">
                <p><strong>Business Name:</strong> ${data.businessName}</p>
                <p><strong>Owner Email:</strong> ${data.ownerEmail}</p>
                <p><strong>Owner Name:</strong> ${data.ownerName || 'Not provided'}</p>
                <p><strong>City:</strong> ${data.city || 'Not specified'}</p>
                <p><strong>Category:</strong> ${data.category || 'Not specified'}</p>
                <p><strong>Submitted:</strong> ${data.submittedAt.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</p>
            </div>

            <a href="https://9jadirectory.org/admin/listings" class="btn">Review Listing</a>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: ADMIN_EMAIL, subject, text, html })
        console.log('Admin notified of new listing:', data.businessName)
        return true
    } catch (error) {
        console.error('Failed to notify admin of new listing:', error)
        return false
    }
}

// Send email to customer when listing is approved
export async function notifyCustomerListingApproved(data: ListingApprovedData) {
    const subject = `Your Listing is Live! - ${data.businessName}`

    const text = `
Hello ${data.ownerName || 'Valued Customer'},

Great news! Your business listing "${data.businessName}" has been approved and is now live on 9jaDirectory!

Your listing is now visible to thousands of potential customers searching for businesses like yours.

View your listing here:
${data.listingUrl}

Tips to get more visibility:
- Keep your business information up to date
- Add photos to attract more customers
- Consider upgrading to a Premium plan for featured placement

Thank you for choosing 9jaDirectory!

Best regards,
The 9jaDirectory Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .btn { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        .tips { background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .tips h3 { color: #16a34a; margin-top: 0; }
        .tips ul { margin: 0; padding-left: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Your Listing is Live!</h1>
        </div>
        <div class="content">
            <p>Hello ${data.ownerName || 'Valued Customer'},</p>
            <p>Great news! Your business listing <strong>"${data.businessName}"</strong> has been approved and is now live on 9jaDirectory!</p>
            <p>Your listing is now visible to thousands of potential customers searching for businesses like yours.</p>

            <p style="text-align: center;">
                <a href="${data.listingUrl}" class="btn">View Your Listing</a>
            </p>

            <div class="tips">
                <h3>Tips to get more visibility:</h3>
                <ul>
                    <li>Keep your business information up to date</li>
                    <li>Add photos to attract more customers</li>
                    <li>Consider upgrading to a Premium plan for featured placement</li>
                </ul>
            </div>

            <p>Thank you for choosing 9jaDirectory!</p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
            <p><a href="https://9jadirectory.org">www.9jadirectory.org</a></p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: data.ownerEmail, subject, text, html })
        console.log('Customer notified of listing approval:', data.ownerEmail)
        return true
    } catch (error) {
        console.error('Failed to notify customer of listing approval:', error)
        return false
    }
}

// Send email to customer when listing is rejected
export async function notifyCustomerListingRejected(data: ListingRejectedData) {
    const subject = `Listing Update Required - ${data.businessName}`

    const text = `
Hello ${data.ownerName || 'Valued Customer'},

We have reviewed your business listing "${data.businessName}" and unfortunately it was not approved at this time.

Reason: ${data.rejectionReason}

Don't worry! You can update your listing and resubmit it for review. Please address the issues mentioned above and try again.

Edit your listing here:
https://9jadirectory.org/dashboard/my-listings

If you have any questions, please contact our support team.

Best regards,
The 9jaDirectory Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reason-box { background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .btn { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Listing Update Required</h1>
        </div>
        <div class="content">
            <p>Hello ${data.ownerName || 'Valued Customer'},</p>
            <p>We have reviewed your business listing <strong>"${data.businessName}"</strong> and unfortunately it was not approved at this time.</p>

            <div class="reason-box">
                <p><strong>Reason:</strong></p>
                <p>${data.rejectionReason}</p>
            </div>

            <p>Don't worry! You can update your listing and resubmit it for review. Please address the issues mentioned above and try again.</p>

            <p style="text-align: center;">
                <a href="https://9jadirectory.org/dashboard/my-listings" class="btn">Edit Your Listing</a>
            </p>

            <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
            <p><a href="https://9jadirectory.org">www.9jadirectory.org</a></p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: data.ownerEmail, subject, text, html })
        console.log('Customer notified of listing rejection:', data.ownerEmail)
        return true
    } catch (error) {
        console.error('Failed to notify customer of listing rejection:', error)
        return false
    }
}

// Send email to admin when contact form is submitted
export async function notifyAdminContactForm(data: ContactFormData) {
    const subject = `Contact Form: ${data.subject}`

    const text = `
Hello Admin,

You have received a new message from the contact form on 9jaDirectory.

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
Reply directly to this email or to ${data.email}

Best regards,
9jaDirectory System
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #16a34a; }
        .message-box { background-color: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .reply-btn { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Message</h1>
        </div>
        <div class="content">
            <p>You have received a new message from the contact form.</p>

            <div class="info-box">
                <p><strong>From:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
            </div>

            <div class="message-box">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${data.message}</p>
            </div>

            <p style="text-align: center;">
                <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" class="reply-btn">Reply to ${data.name}</a>
            </p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({
            to: ADMIN_EMAIL,
            subject,
            text,
            html,
            replyTo: data.email
        })
        console.log('Admin notified of contact form submission from:', data.email)
        return true
    } catch (error) {
        console.error('Failed to notify admin of contact form:', error)
        return false
    }
}

// Send newsletter verification email
export async function sendNewsletterVerification(data: NewsletterVerificationData) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
    const verifyUrl = `${siteUrl}/newsletter/verify?token=${data.verificationToken}`
    const subject = 'Confirm your 9jaDirectory Newsletter Subscription'

    const text = `
Hello,

Thank you for subscribing to the 9jaDirectory newsletter!

Please confirm your subscription by clicking the link below:
${verifyUrl}

If you didn't subscribe to our newsletter, you can safely ignore this email.

Best regards,
The 9jaDirectory Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .note { font-size: 13px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Confirm Your Subscription</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for subscribing to the <strong>9jaDirectory newsletter</strong>!</p>
            <p>You'll receive weekly updates on featured businesses, new listings, and exclusive deals from Nigerian businesses.</p>

            <p style="text-align: center;">
                <a href="${verifyUrl}" class="btn">Confirm Subscription</a>
            </p>

            <p class="note">If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
            <p><a href="${siteUrl}">www.9jadirectory.org</a></p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: data.email, subject, text, html })
        console.log('Newsletter verification email sent to:', data.email)
        return true
    } catch (error) {
        console.error('Failed to send newsletter verification email:', error)
        return false
    }
}

// Send newsletter welcome email after verification
export async function sendNewsletterWelcome(data: NewsletterWelcomeData) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?email=${encodeURIComponent(data.email)}`
    const subject = 'Welcome to the 9jaDirectory Newsletter!'

    const text = `
Welcome to 9jaDirectory!

Your subscription has been confirmed. You'll now receive our weekly newsletter with:

- Featured businesses across Nigeria
- New listings and business updates
- Exclusive deals and promotions
- Business tips and industry insights

We send our newsletter every week, so keep an eye on your inbox!

Explore businesses now: ${siteUrl}

To unsubscribe at any time: ${unsubscribeUrl}

Best regards,
The 9jaDirectory Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .features { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .features ul { margin: 0; padding-left: 20px; }
        .features li { margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Welcome to 9jaDirectory!</h1>
        </div>
        <div class="content">
            <p>Your subscription has been confirmed!</p>
            <p>You'll now receive our weekly newsletter with the best of Nigerian businesses.</p>

            <div class="features">
                <strong>What you'll receive:</strong>
                <ul>
                    <li>Featured businesses across Nigeria</li>
                    <li>New listings and business updates</li>
                    <li>Exclusive deals and promotions</li>
                    <li>Business tips and industry insights</li>
                </ul>
            </div>

            <p style="text-align: center;">
                <a href="${siteUrl}" class="btn">Explore Businesses</a>
            </p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
            <p><a href="${siteUrl}">www.9jadirectory.org</a></p>
            <p style="margin-top: 15px; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: data.email, subject, text, html })
        console.log('Newsletter welcome email sent to:', data.email)
        return true
    } catch (error) {
        console.error('Failed to send newsletter welcome email:', error)
        return false
    }
}

// Send unsubscribe confirmation email
export async function sendNewsletterUnsubscribeConfirmation(data: NewsletterUnsubscribeData) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://9jadirectory.org'
    const subject = 'You have been unsubscribed from 9jaDirectory Newsletter'

    const text = `
Hello,

You have been successfully unsubscribed from the 9jaDirectory newsletter.

We're sorry to see you go! If you change your mind, you can always resubscribe at:
${siteUrl}

Thank you for being part of our community.

Best regards,
The 9jaDirectory Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6b7280; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Unsubscribed</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You have been successfully unsubscribed from the 9jaDirectory newsletter.</p>
            <p>We're sorry to see you go! If you change your mind, you can always resubscribe.</p>

            <p style="text-align: center;">
                <a href="${siteUrl}" class="btn">Visit 9jaDirectory</a>
            </p>

            <p>Thank you for being part of our community.</p>
        </div>
        <div class="footer">
            <p>9jaDirectory - Nigeria's Business Directory</p>
            <p><a href="${siteUrl}">www.9jadirectory.org</a></p>
        </div>
    </div>
</body>
</html>
    `.trim()

    try {
        await sendEmail({ to: data.email, subject, text, html })
        console.log('Newsletter unsubscribe confirmation sent to:', data.email)
        return true
    } catch (error) {
        console.error('Failed to send newsletter unsubscribe confirmation:', error)
        return false
    }
}
