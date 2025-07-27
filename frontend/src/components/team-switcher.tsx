"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function TeamSwitcher() {
  const team = {
    name: "PeepPips",
    logo: TrendingUp,
    plan: "Enterprise",
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="bg-sideba text-sidebar-primary-foreground  flex aspect-square size-8 items-center justify-center rounded-lg">
            <Image
              src="/1.png"
              alt="PeepPips"
              width={52}
              height={52}
              className="w-full h-full object-contain  rounded"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold  text-lg text-primary">
              {team.name}
            </span>
            {/* <span className="truncate text-xs">{team.plan}</span> */}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
