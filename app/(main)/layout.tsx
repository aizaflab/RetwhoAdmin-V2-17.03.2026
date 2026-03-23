import React from "react";

import {
  Header,
  Sidebar,
  SidebarProvider,
} from "@/components/modules/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F8F8F8] dark:bg-black flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header />
          <main className="flex-1 p-3 sm:p-5 ">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
