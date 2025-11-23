'use client'

import { useState } from 'react'
import { submitClaim } from '@/app/actions/claims'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/common/file-uploader'

export default function ClaimPage({ params }: { params: { slug: string } }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [proofUrl, setProofUrl] = useState('')
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setError(null)

        try {
            // Append the proof URL to the form data if it exists
            if (proofUrl) {
                formData.set('proof_document', proofUrl)
            }

            const result = await submitClaim(formData)
            if (result.success) {
                alert('Claim submitted successfully! An admin will review your request.')
                router.push(`/listings/${params.slug}`)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Claim this Business
                    </h1>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    To claim this business, you must provide proof of ownership (e.g., CAC certificate, utility bill, or business license).
                                </p>
                            </div>
                        </div>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <input type="hidden" name="slug" value={params.slug} />

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Additional Notes
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    placeholder="Please explain your relationship to this business..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Proof of Ownership Document
                            </label>
                            <FileUploader
                                bucket="documents"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                label="Upload CAC or Business Document"
                                onUploadComplete={(url) => setProofUrl(url)}
                            />
                            <input type="hidden" name="proof_document" value={proofUrl} required />
                            <p className="mt-2 text-sm text-gray-500">
                                Upload a clear copy of your business registration or other proof.
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !proofUrl}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
