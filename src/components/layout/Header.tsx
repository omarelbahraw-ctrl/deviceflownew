"use client";

import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
        <span className="sr-only">فتح القائمة</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            onClick={async () => {
              await fetch('/api/auth', { method: 'DELETE' });
              window.location.href = '/login';
            }}
            className="text-sm font-bold leading-6 text-red-600 hover:text-red-800 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </header>
  );
}
