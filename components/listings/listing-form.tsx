'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/common/file-uploader'
import { createListing, updateListing } from '@/app/actions/listings'

interface ListingFormProps {
    initialData?: any
    categories: { id: string; name: string }[]
    states: { id: string; name: string }[]
    isEditing?: boolean
}

export default function ListingForm({ initialData, categories, states, isEditing = false }: ListingFormProps) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('basic')

    // State for complex fields
    const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '')
    const [images, setImages] = useState<string[]>(initialData?.images || [])

    // Simple hours state (Mon-Fri, Sat, Sun)
    const defaultHours = {
        weekdays: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '', close: '', closed: true }
    }
    const [hours, setHours] = useState(initialData?.opening_hours || defaultHours)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const form = e.currentTarget
        if (!form.checkValidity()) {
            setError('Please fill in all required fields before submitting.')
            // Find the first invalid field
            const invalidField = form.querySelector(':invalid') as HTMLElement | null
            if (invalidField) {
                // Find which tab contains this field
                const tabName = invalidField.closest('[data-tab]')?.getAttribute('data-tab')
                if (tabName) {
                    setActiveTab(tabName)
                    // Give React a moment to render the tab as visible before scrolling/focusing
                    setTimeout(() => {
                        invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        invalidField.focus()
                    }, 100)
                }
            }
            setSubmitting(false)
            return
        }

        const formData = new FormData(form)

        // Append complex fields
        formData.set('logo_url', logoUrl)
        formData.set('images', JSON.stringify(images))
        formData.set('opening_hours', JSON.stringify(hours))

        console.log('Form Submission - Images State:', images)
        console.log('Form Submission - FormData Images:', formData.get('images'))

        if (isEditing && initialData?.id) {
            formData.set('id', initialData.id)
        }

        try {
            console.log('Submitting form data...')
            if (isEditing) {
                await updateListing(formData)
                router.push('/dashboard/my-listings')
            } else {
                await createListing(formData)
                router.push('/dashboard?success=true')
            }
            router.refresh()
        } catch (err: any) {
            console.error('Submission error:', err)
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleHoursChange = (dayGroup: string, field: string, value: any) => {
        setHours((prev: any) => ({
            ...prev,
            [dayGroup]: { ...prev[dayGroup], [field]: value }
        }))
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                    {['basic', 'media', 'contact', 'hours'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab} Info
                        </button>
                    ))}
                </nav>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info Tab */}
                <div className={activeTab === 'basic' ? 'block' : 'hidden'} data-tab="basic">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input
                                type="text"
                                name="business_name"
                                id="business_name"
                                defaultValue={initialData?.business_name}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category_id"
                                name="category_id"
                                defaultValue={initialData?.category_id}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="">Select a category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={initialData?.description}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Media Tab */}
                <div className={activeTab === 'media' ? 'block' : 'hidden'} data-tab="media">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                            <div className="w-full sm:w-1/2">
                                <FileUploader
                                    id="logo-uploader"
                                    bucket="avatars" // Using avatars bucket for logos for now as it's public
                                    label="Upload Logo"
                                    currentFileUrl={logoUrl}
                                    onUploadComplete={setLogoUrl}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (Cover)</label>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={img} alt={`Gallery ${idx}`} className="h-24 w-full object-cover rounded-md" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <div className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                                    <div className="w-full h-full p-2">
                                        <FileUploader
                                            id="gallery-uploader"
                                            bucket="avatars" // Reusing public bucket
                                            label="Add Image"
                                            onUploadComplete={(url) => {
                                                console.log('Image uploaded, adding to state:', url)
                                                setImages(prev => [...prev, url])
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Social Tab */}
                <div className={activeTab === 'contact' ? 'block' : 'hidden'} data-tab="contact">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" name="phone" id="phone" defaultValue={initialData?.phone} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">WhatsApp</label>
                            <input
                                type="tel"
                                name="whatsapp_number"
                                id="whatsapp_number"
                                defaultValue={initialData?.whatsapp_number || initialData?.whatsapp}
                                placeholder="+234..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" defaultValue={initialData?.email} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">Website</label>
                            <input
                                type="url"
                                name="website_url"
                                id="website_url"
                                defaultValue={initialData?.website_url || initialData?.website}
                                placeholder="https://"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>

                        <div className="sm:col-span-6 border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Location</h4>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                    <input type="text" name="address" id="address" defaultValue={initialData?.address} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                                <div className="sm:col-span-3">
                                    <label htmlFor="state_id" className="block text-sm font-medium text-gray-700">State</label>
                                    <select id="state_id" name="state_id" defaultValue={initialData?.state_id} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                        <option value="">Select State</option>
                                        {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-3">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                    <input type="text" name="city" id="city" defaultValue={initialData?.city} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-6 border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Social Media</h4>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Facebook URL</label>
                                    <input type="url" name="facebook_url" defaultValue={initialData?.facebook_url} placeholder="https://facebook.com/..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Instagram URL</label>
                                    <input type="url" name="instagram_url" defaultValue={initialData?.instagram_url} placeholder="https://instagram.com/..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Twitter (X) URL</label>
                                    <input type="url" name="twitter_url" defaultValue={initialData?.twitter_url} placeholder="https://twitter.com/..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">LinkedIn URL</label>
                                    <input type="url" name="linkedin_url" defaultValue={initialData?.linkedin_url} placeholder="https://linkedin.com/in/..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hours Tab */}
                <div className={activeTab === 'hours' ? 'block' : 'hidden'} data-tab="hours">
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500">Set your standard operating hours.</p>

                        {['weekdays', 'saturday', 'sunday'].map((day) => (
                            <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                                <div className="w-24 font-medium capitalize">{day}</div>
                                <div className="flex items-center space-x-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={hours[day]?.closed}
                                            onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Closed</span>
                                    </label>
                                </div>
                                {!hours[day]?.closed && (
                                    <>
                                        <input
                                            type="time"
                                            value={hours[day]?.open}
                                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                            className="border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="time"
                                            value={hours[day]?.close}
                                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                            className="border border-gray-300 rounded-md shadow-sm py-1 px-2 sm:text-sm"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error & Submit */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-5 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : (isEditing ? 'Update Listing' : 'Create Listing')}
                    </button>
                </div>
            </form>
        </div>
    )
}
