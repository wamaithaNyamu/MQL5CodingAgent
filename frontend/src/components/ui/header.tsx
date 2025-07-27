"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  UserCircle2,
  Sparkles,
  User,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { navMainItems } from "@/config/navigation";
import { ToggleTheme } from "./toggle-theme";

interface HeaderProps {
  sidebarItems?: {
    title: string;
    url: string;
    icon?: React.ComponentType;
  }[];
}

export function Header({ sidebarItems = navMainItems }: HeaderProps) {
  const pathname = usePathname();

  const activeItem = sidebarItems?.find(
    (item) =>
      pathname === item.url ||
      (pathname.startsWith(item.url) && item.url !== "/")
  ) || { title: "Dashboard" };

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 transition-all duration-200 ease-in-out bg-white">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
        </div>

        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {activeItem.title}
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-1 mr-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary gap-1 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pro</span>
          </Button>
        </div>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 border-muted-foreground/20 relative"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help Center</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-muted-foreground/20 relative">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Calendar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 border-muted-foreground/20 relative"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  3
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications (3)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* <ToggleTheme /> */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 border-muted-foreground/20 relative"
              >
                {/* <Settings className="h-4 w-4 text-muted-foreground" /> */}
                <ToggleTheme />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                <span className="hidden md:inline">Toggle </span>Theme
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User</span>
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium text-primary">Super Admin</span>
              <span className="text-xs text-muted-foreground font-normal">
                admin@skystocks.com
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <UserCircle2 className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive gap-2">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
