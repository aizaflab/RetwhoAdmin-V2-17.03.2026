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
      <div className="min-h-screen bg-gray-50 dark:bg-black font-sans flex">
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header />

          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-5 overflow-y-auto bg-blue-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
