import {
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
  CircleDollarSignIcon,
  ClipboardCheckIcon,
  LucideIcon,
  BriefcaseBusiness,
  Info,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

type CardData = {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend: {
    direction: "up" | "down" | "stable";
    text: string;
  };
  description: string;
};

export function SectionCards() {
  const cardsData: CardData[] = [
    {
      title: "Total Revenue",
      value: "KES 1,250.00",
      icon: CircleDollarSignIcon,
      iconColor: "text-emerald-600",
      iconBgColor: "bg-emerald-100/80",
      trend: {
        direction: "up",
        text: "+8.2% since last month",
      },
      description: "Monthly subscription revenue",
    },
    {
      title: "Total Registered Business",
      value: "1,234",
      icon: BriefcaseBusiness,
      iconColor: "text-white-600",
      iconBgColor: "bg-white-100/80",
      trend: {
        direction: "up",
        text: "+12 new businesses",
      },
      description: "Overall business growth",
    },
    {
      title: "Active Accounts",
      value: "45,678",
      icon: UsersIcon,
      iconColor: "text-violet-600",
      iconBgColor: "bg-violet-100/80",
      trend: {
        direction: "up",
        text: "+5.7% this quarter",
      },
      description: "Current active user sessions",
    },
    {
      title: "Pending Business Approvals",
      value: "123",
      icon: ClipboardCheckIcon,
      iconColor: "text-orange-600",
      iconBgColor: "bg-orange-100/80",
      trend: {
        direction: "stable",
        text: "-15% from last week",
      },
      description: "Require review & approval",
    },
  ];

  return (
    <div className="flex flex-wrap gap-6 px-2 overflow-x-auto">
    {cardsData.map((card, index) => (
      <Card
        key={index}
        className="flex-1 min-w-[250px] max-w-sm @container/card relative group overflow-hidden rounded-sm bg-transparent border border-slate-900 dark:border-slate-400 
       transition-all duration-300 ease-out"
      >
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-3">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardDescription>
  
            <div
              className={cn(
                "flex items-center justify-center size-10 rounded-full transition-transform group-hover:scale-110",
                card.iconBgColor
              )}
            >
              <card.icon className={cn("size-5", card.iconColor)} />
            </div>
          </div>
  
          <CardTitle className="text-xl font-bold tracking-tight tabular-nums">
            {card.value}
          </CardTitle>
        </CardHeader>
  
        <CardFooter className="pt-0">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center justify-center size-5 rounded-full",
                card.trend.direction === "up"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : card.trend.direction === "down"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-white-100 text-white-600 dark:bg-white-900/30 dark:text-white-400"
              )}
            >
              {card.trend.direction === "up" ? (
                <TrendingUpIcon className="size-3" />
              ) : card.trend.direction === "down" ? (
                <TrendingDownIcon className="size-3" />
              ) : (
                <Info className="size-3" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        </CardFooter>
      </Card>
    ))}
  </div>
  
  );
}
