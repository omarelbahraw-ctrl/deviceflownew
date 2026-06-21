"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLayoutState } from "./LayoutContext";
import { X } from "lucide-react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useLayoutState();

  // Pages that should occupy the full screen without the DeviceFlow sidebar/header
  const isFullScreen = 
    pathname === "/login" || 
    pathname === "/" || 
    pathname === "/voice-chat";

  if (isFullScreen) {
    return <main className="flex-1 h-full w-full overflow-hidden bg-slate-950">{children}</main>;
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 flex z-40 rtl:right-0 ltr:left-0">
            {/* Sidebar container */}
            <div className="relative flex w-64 shadow-2xl">
              {/* Close button outside sidebar */}
              <div className="absolute top-0 flex pt-4 rtl:left-0 rtl:-ml-14 ltr:right-0 ltr:-mr-14">
                <button
                  type="button"
                  className="rounded-full bg-slate-800 p-2 text-white hover:bg-slate-700 shadow-md transition-all"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              
              {/* The actual sidebar */}
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 print:hidden">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 print:p-0 print:bg-white">
          {children}
        </main>
      </div>
    </>
  );
}
