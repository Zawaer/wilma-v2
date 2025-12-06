import { getTranslations } from "next-intl/server";
import { Calendar, Home, Inbox, Settings } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

interface AppSidebarProps {
    user?: {
        name: string;
        email: string;
        avatar: string;
    };
}

export async function AppSidebar({ user }: AppSidebarProps) {
    const t = await getTranslations("Sidebar");

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
    ];

    return (
        <Sidebar>
            <SidebarContent className="p-2">
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
            <SidebarFooter>
                <NavUser
                    user={{
                        name: user?.name || "No name",
                        email: user?.email || "No school",
                        avatar: user?.avatar || "-",
                    }}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
