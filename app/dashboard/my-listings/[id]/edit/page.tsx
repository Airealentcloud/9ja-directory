import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ListingForm from '@/components/listings/listing-form'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch listing
    const { data: listing } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

    if (!listing) {
        notFound()
    }

    // Verify ownership or admin
    if (listing.user_id !== user.id) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
            redirect('/dashboard/my-listings')
        }
    }

    // Fetch form data
    const { data: categories } = await supabase.from('categories').select('id, name').order('name')
    const { data: states } = await supabase.from('states').select('id, name').order('name')

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
                <p className="mt-2 text-gray-600">
                    Update your business details.
                </p>
            </div>

            <ListingForm
                initialData={listing}
                categories={categories || []}
                states={states || []}
                isEditing={true}
            />
        </div>
    )
}
