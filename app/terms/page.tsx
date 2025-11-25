import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service | 9jaDirectory',
    description: 'Terms and conditions for using 9jaDirectory services.',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                    <div className="prose prose-green max-w-none text-gray-700">
                        <p className="lead">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using 9jaDirectory ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                            In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>

                        <h3>2. Description of Service</h3>
                        <p>
                            9jaDirectory provides users with access to a rich collection of resources, including business listings, reviews, and search functionality.
                            You understand and agree that the Service is provided "AS-IS" and that 9jaDirectory assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
                        </p>

                        <h3>3. User Obligations</h3>
                        <p>
                            You agree to use the Service only for purposes that are permitted by (a) the Terms and (b) any applicable law, regulation or generally accepted practices or guidelines in the relevant jurisdictions.
                        </p>

                        <h3>4. Business Listings</h3>
                        <p>
                            If you list a business on 9jaDirectory, you are responsible for maintaining the accuracy of the information provided.
                            We reserve the right to remove any listing that violates our policies or contains false or misleading information.
                        </p>

                        <h3>5. Privacy Policy</h3>
                        <p>
                            Your use of the Service is also subject to our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
                        </p>

                        <h3>6. Modifications to Terms</h3>
                        <p>
                            We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms at any time.
                            Such modifications shall become effective immediately upon the posting thereof. You must review this agreement on a regular basis to keep yourself apprised of any changes.
                        </p>

                        <h3>7. Contact Information</h3>
                        <p>
                            If you have any questions about these Terms, please contact us at support@9jadirectory.org.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
