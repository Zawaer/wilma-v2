import { getTranslations } from 'next-intl/server';
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export async function AppSidebar() {
  const t = await getTranslations('Sidebar');

  const items = [
    {
      title: t("home"),
      url: "home",
      icon: Home,
    },
    {
      title: t("messages"),
      url: "messages",
      icon: Inbox,
    },
    {
      title: t("schedule"),
      url: "schedule",
      icon: Calendar,
    },
    {
      title: t("settings"),
      url: "settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="gap-0 mt-2 ml-2">
        <span className='text-2xl font-semibold'>Toivo Kallio</span>
        <span className='text-sm text-zinc-700 dark:text-zinc-400'>Otaniemen lukio</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}