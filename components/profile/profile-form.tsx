'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import FileUploader from '@/components/common/file-uploader'

interface ProfileFormProps {
    user: any
    profile: any
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
    const [isSaving, setIsSaving] = useState(false)

    async function handleUpdateProfile(formData: FormData) {
        setIsSaving(true)
        try {
            await updateProfile(formData)
            alert('Profile updated successfully!')
        } catch (error) {
            alert('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form action={handleUpdateProfile} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                        {/* Avatar Upload */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">
                                Profile Photo
                            </label>
                            <div className="mt-1 flex items-center">
                                <input type="hidden" name="avatar_url" value={avatarUrl} />
                                <FileUploader
                                    bucket="avatars"
                                    currentFileUrl={avatarUrl}
                                    onUploadComplete={(url) => setAvatarUrl(url)}
                                    label="Change Photo"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    defaultValue={profile?.full_name || ''}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="phone_number"
                                    id="phone_number"
                                    defaultValue={profile?.phone_number || ''}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                Bio
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    defaultValue={profile?.bio || ''}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Write a few sentences about yourself.
                            </p>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Street Address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    defaultValue={profile?.address || ''}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                City
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    defaultValue={profile?.city || ''}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                State
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="state"
                                    id="state"
                                    defaultValue={profile?.state || ''}
                                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </form>
    )
}
