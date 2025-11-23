'use client'

import { useState } from 'react'

type OpeningHours = {
    [key: string]: {
        open: string
        close: string
        closed?: boolean
    }
}

export default function OperatingHours({ hours }: { hours: OpeningHours | null }) {
    if (!hours) return null

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    // Check if currently open
    const now = new Date()
    const currentDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1] // Convert to our format
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

    const todayHours = hours[currentDay]
    const isOpen = todayHours && !todayHours.closed &&
        currentTime >= todayHours.open && currentTime <= todayHours.close

    return (
        <div className="pb-4">
            <div className="text-sm font-medium text-gray-600 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                    <span className="mr-2">🕒</span>
                    Business Hours
                </span>
                {todayHours && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {isOpen ? '🟢 Open Now' : '🔴 Closed'}
                    </span>
                )}
            </div>
            <div className="space-y-2 text-sm">
                {days.map((day, index) => {
                    const dayHours = hours[day]
                    const isToday = day === currentDay

                    return (
                        <div
                            key={day}
                            className={`flex justify-between ${isToday ? 'font-semibold' : ''}`}
                        >
                            <span className={isToday ? 'text-gray-900' : 'text-gray-600'}>
                                {dayNames[index]}
                            </span>
                            <span className={dayHours?.closed ? 'text-red-600' : 'text-gray-900'}>
                                {dayHours?.closed ? 'Closed' : `${dayHours?.open || ''} - ${dayHours?.close || ''}`}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
