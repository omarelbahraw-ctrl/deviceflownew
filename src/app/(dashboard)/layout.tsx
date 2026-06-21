"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LayoutProvider, useLayoutState } from "@/components/layout/LayoutContext";
import { X } from "lucide-react";
import { useTranslation } from "@/components/layout/LanguageContext";
import clsx from "clsx";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setIsSidebarOpen } = useLayoutState();
  const { isRtl } = useTranslation();

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:hidden",
        isSidebarOpen 
          ? "translate-x-0" 
          : isRtl ? "translate-x-full" : "-translate-x-full",
        isRtl ? "right-0" : "left-0",
        !isSidebarOpen && "pointer-events-none"
      )}>
        <div className="relative flex w-full flex-1 flex-col">
          <div className={clsx("absolute top-0 flex w-16 justify-center pt-5 transition-opacity", 
            isRtl ? "-left-16" : "-right-16",
            !isSidebarOpen && "opacity-0"
          )}>
            <button
              type="button"
              className="-m-2.5 p-2.5"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:z-50">
        <Sidebar />
      </div>

      <div className={clsx("flex flex-1 flex-col h-full overflow-hidden transition-all duration-300 lg:pl-64", isRtl ? "lg:pr-64 lg:pl-0" : "lg:pl-64")}>
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </div>
    </LayoutProvider>
  );
}
