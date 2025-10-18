"use client";

export default function SchedulePage() {
    return (
        <div className="flex flex-col w-screen h-screen gap-4 p-8">
            <span className="text-4xl font-semibold">Schedule</span>
            <div className="grid grid-cols-5 gap-2">
                {/* Column headers */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                    <div key={day} className="font-bold text-center">{day}</div>
                ))}

                {/* Schedule slots (e.g., 8am-5pm) */}
                {Array.from({ length: 5 * 9 }).map((_, idx) => (
                    <div key={idx} className="border p-2 text-center">
                    {/* optional: slot content */}
                    </div>
                ))}
            </div>
        </div>
    )
}