"use client";

import * as React from "react";
import {
  AudioWaveform,
  BriefcaseBusiness,
  ChartBar,
  Command,
  Home,
  Settings,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navMainItems } from "@/config/navigation";
// 👇 Import the refactored component here
import ChatSidebarContent from "@/app/(dashboard)/conversations/ChatSidebarContent"; // Adjust path as needed

// import Logo from "./shared/logo";

// This is sample data.
export const data = {
  user: {
    name: "Super Admin",
    // name: "Sky Stocks",
    email: "admin@skystocks.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Sky Stocks",
      logo: TrendingUp,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    // {
    //   title: "Games",
    //   url: "/games",
    //   icon: Home,
    // },
    // {
    //   title: "Business",
    //   url: "/business",
    //   icon: BriefcaseBusiness,
    // },
    // {
    //   title: "Products",
    //   url: "/products",
    //   icon: ShoppingBag,
    // },
    // {
    //   title: "Reports",
    //   url: "/reports",
    //   icon: ChartBar,
    // },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon" // This prop handles the collapse/expand behavior
      className="border-r bg-white backdrop-blur "
      {...props}
    >
      <SidebarHeader className="py-4">
        {/* <Logo /> */}
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="py-2">
        {/* <NavMain items={navMainItems} /> */}
        {/* conversations list and new chat button */}
        {/* 👇 Place your refactored chat content component here */}
        <ChatSidebarContent />
      </SidebarContent>
      {/* <SidebarFooter className="border-t py-4">
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}