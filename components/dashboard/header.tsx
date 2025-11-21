'use client'

export default function Header({ user }: { user: any }) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">
                        {user?.user_metadata?.full_name || user?.email}
                    </span>
                    <span className="text-xs text-gray-500">
                        {user?.email}
                    </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                    {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
            </div>
        </header>
    )
}
