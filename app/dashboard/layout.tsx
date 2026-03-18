import React from "react";

import { ThemeToggle } from "@/components/ui";
import Sidebar from "@/components/modules/navigation/_components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="lg:hidden ml-12">
            {/* Mobile Sidebar toggle area placeholder so text doesn't overlap */}
            <span className="font-semibold text-lg text-black dark:text-white">
              Admin
            </span>
          </div>

          <div className="hidden lg:flex flex-1 items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* User Profile / Notifications can go here */}
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
