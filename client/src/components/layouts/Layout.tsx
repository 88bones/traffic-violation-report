import { Outlet } from "react-router-dom";
import AppSidebar from "./SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 border-b px-6 py-3">
            <SidebarTrigger /> {/* ← collapse button */}
            <h1 className="text-sm font-medium text-muted-foreground">
              Traffic Violation Dashboard
            </h1>
          </div>
          <div className="p-6">
            <Outlet /> {/* ← pages render here */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
