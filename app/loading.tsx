export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="flex items-center gap-3 text-gray-700">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  )
}

