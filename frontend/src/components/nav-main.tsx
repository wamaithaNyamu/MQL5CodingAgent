"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export function NavMain({
  items,
  collapsed = false,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  collapsed?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => {
                  router.push(item.url);
                  // Close sidebar when an item is clicked on mobile
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
                className="w-full"
                variant="default"
                size="lg"
                data-active={isActive}
                data-state={isActive ? "active" : "inactive"}
                data-collapsed={collapsed}
              >
                {/* {item.icon && (
                  <item.icon 
                    className={`h-5 w-5 ${
                    collapsed ? "ml-2" : "mr-2"
                    } ${
                    isActive ? "text-primary" : "text-muted-foreground"
                    }`} 
                  />
                )} */}

                {item.icon && (
                  <div
                    className={`${
                      collapsed ? "mx-auto" : "mr-2"
                    } flex aspect-square size-8 items-center justify-center rounded-lg ${
                      isActive
                        ? "text-primary bg-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                  </div>
                )}
                {!collapsed && (
                  <span
                    className={`font-medium ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
