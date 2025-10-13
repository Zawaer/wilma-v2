"use client";

import { useTheme } from "next-themes"
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [themeSelectValue, setThemeSelectValue] = useState<string>("system");
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("Settings");

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setThemeSelectValue(theme ?? "system")
    }
  }, [theme, mounted])

  const handleThemeChange = (value: string) => {
    setTheme(value);
    setThemeSelectValue(value);
  }

  return (
    <div className="flex flex-col w-screen h-screen gap-4 p-8">
      <span className="text-4xl">Settings</span>
      <div>
        <span>Theme</span>
        <Select value={themeSelectValue} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue defaultValue="system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t("light")}</SelectItem>
            <SelectItem value="dark">{t("dark")}</SelectItem>
            <SelectItem value="system">{t("system")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    )
}