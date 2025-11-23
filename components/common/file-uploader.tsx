'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FileUploaderProps {
    bucket: 'avatars' | 'documents'
    onUploadComplete: (url: string) => void
    label?: string
    accept?: string
    currentFileUrl?: string
    id?: string
}

export default function FileUploader({
    bucket,
    onUploadComplete,
    label = 'Upload File',
    accept = 'image/*',
    currentFileUrl,
    id
}: FileUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Generate a unique ID if one isn't provided
    const inputId = id || `file-upload-${bucket}-${Math.random().toString(36).substr(2, 9)}`

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            setError(null)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // For public buckets like avatars, we can get the public URL
            if (bucket === 'avatars') {
                const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
                onUploadComplete(data.publicUrl)
            } else {
                // For private buckets, we might just return the path or a signed URL
                // For now, returning the path which can be used to generate signed URLs later
                // Or if we want a signed URL immediately:
                const { data } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year
                if (data?.signedUrl) {
                    onUploadComplete(data.signedUrl)
                } else {
                    onUploadComplete(filePath)
                }
            }

        } catch (error: any) {
            setError(error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {currentFileUrl && bucket === 'avatars' && (
                <div className="mb-4">
                    <img
                        src={currentFileUrl}
                        alt="Current file"
                        className="h-20 w-20 object-cover rounded-full border border-gray-200"
                    />
                </div>
            )}

            {currentFileUrl && bucket === 'documents' && (
                <div className="mb-4 text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    File uploaded successfully
                </div>
            )}

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
                <div className="space-y-1 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label
                            htmlFor={inputId}
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                        >
                            <span>{uploading ? 'Uploading...' : 'Upload a file'}</span>
                            <input
                                id={inputId}
                                type="file"
                                className="sr-only"
                                accept={accept}
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                        {accept === 'image/*' ? 'PNG, JPG, GIF up to 5MB' : 'PDF, DOC, Images up to 10MB'}
                    </p>
                </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    )
}
