"use client";

import { Bell, Search, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
        <span className="sr-only">فتح القائمة</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            بحث
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pr-8 pl-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
            placeholder="البحث برقم السيريال (Serial Number)..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative">
            <span className="sr-only">عرض الإشعارات</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-2 right-3 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

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
