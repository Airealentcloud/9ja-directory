'use client'

interface HeaderProps {
    user: any
    onMenuClick?: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 mr-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    aria-label="Open menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-lg lg:text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="hidden sm:flex flex-col items-end">
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
