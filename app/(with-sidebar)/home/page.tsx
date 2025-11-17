"use client";

import { useTranslations } from "next-intl";

export default function SchedulePage() {
    const t = useTranslations("Sidebar");

    return (
        <div className="flex flex-col w-screen h-screen gap-4 p-8">
            <span className="text-4xl font-semibold">{t("home")}</span>
            <div className="flex flex-col">
                TODO
            </div>
        </div>
    );
}
