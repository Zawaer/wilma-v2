"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes"
import { useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [themeSelectValue, setThemeSelectValue] = useState<string>("system");
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState("en");
  const router = useRouter();
  const t = useTranslations("Settings");

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setThemeSelectValue(theme ?? "system")
    }
  }, [theme, mounted])

  useEffect(() => {
    const match = document.cookie.match(/locale=(\w+)/);
    if (match) setLocale(match[1]);
  }, []);

  const handleThemeChange = (selected: string) => {
    setTheme(selected);
    setThemeSelectValue(selected);
  }

  const handleLanguageChange = (selected: string) => {
    document.cookie = `locale=${selected}; path=/; max-age=31536000`; // 1 year
    setLocale(selected);
    router.refresh(); // reloads server components to use new locale
  }

  return (
    <div className="flex flex-col w-screen h-screen gap-4 p-8">
      <span className="text-4xl font-semibold">{t("settings")}</span>
      <div className="flex flex-col">
        <div className="flex w-full items-center p-4">
          <div className="flex flex-col w-1/4">
            <span className="font-semibold">{t("interface_theme")}</span>
            <span className="text-sm">{t("customize_theme")}</span>
          </div>
          <div className="flex w-3/4">
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
        <Separator />
        <div className="flex w-full items-center p-4">
          <div className="flex flex-col w-1/4">
            <span className="font-semibold">Language</span>
            <span className="text-sm">Change display language</span>
          </div>
          <div className="flex w-3/4">
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue defaultValue="system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("english")}</SelectItem>
                <SelectItem value="fi">{t("finnish")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
      </div>
    </div>
    )
}