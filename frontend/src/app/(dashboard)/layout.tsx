import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/ui/header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { data as sidebarData } from "@/components/app-sidebar"; // Adjust this import path as needed

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Header sidebarItems={sidebarData.navMain} />
          <div className="flex flex-1 flex-col p-4 pt-0">
              {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}