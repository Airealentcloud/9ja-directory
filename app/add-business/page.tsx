import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from '@/components/listings/listing-form'

export default async function AddBusinessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/add-business')
    }

    // Fetch data for form
    const { data: categories } = await supabase.from('categories').select('id, name').order('name')
    const { data: states } = await supabase.from('states').select('id, name').order('name')

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Add Your Business</h1>
                <p className="mt-2 text-gray-600">
                    Fill in the details below to list your business on 9jaDirectory.
                </p>
            </div>

            <ListingForm
                categories={categories || []}
                states={states || []}
            />
        </div>
    )
}
