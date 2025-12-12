"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ScheduleGrid } from "@/components/schedule-grid";
import { ScheduleData } from "@/lib/schedule-types";

export default function SchedulePage() {
    const t = useTranslations("Sidebar");
    const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch("/api/schedule");
                
                if (!response.ok) {
                    throw new Error("Failed to fetch schedule");
                }
                
                const data = await response.json();
                setScheduleData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return (
        <div className="flex flex-col w-screen h-screen gap-4 p-8">
            <span className="text-4xl font-semibold">{t("schedule")}</span>
            <div className="flex flex-col flex-1 min-h-0">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground">Loading schedule...</span>
                    </div>
                )}
                
                {error && (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-red-500">Error: {error}</span>
                    </div>
                )}
                
                {scheduleData && !loading && !error && (
                    <ScheduleGrid
                        events={scheduleData.Events}
                        dayStarts={scheduleData.DayStarts}
                        dayEnds={scheduleData.DayEnds}
                        dayCount={scheduleData.DayCount}
                    />
                )}
            </div>
        </div>
    );
}
