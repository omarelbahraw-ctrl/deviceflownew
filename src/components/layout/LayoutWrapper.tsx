"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
