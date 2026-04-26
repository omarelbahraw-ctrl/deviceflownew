"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText,
  PlusCircle,
  Tags,
  Settings
} from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "لوحة القيادة", href: "/", icon: LayoutDashboard },
  { name: "سجل الأذونات", href: "/batches", icon: FileText },
  { name: "استلام جديد", href: "/batches/new", icon: PlusCircle },
  { name: "التجار", href: "/traders", icon: Users },
  { name: "المستودع المخفّض", href: "/discount-warehouse", icon: Tags },
  { name: "الإعدادات", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
      <div className="flex h-16 shrink-0 items-center px-6 bg-slate-950">
        <Package className="h-8 w-8 text-indigo-500 ml-3" />
        <span className="text-xl font-bold tracking-tight text-white">DeviceFlow</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : item.href === "/batches"
              ? pathname === "/batches"
              : pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                    "ml-3 h-6 w-6 flex-shrink-0 transition-colors duration-200"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-white">مدير النظام</p>
            <p className="text-xs font-medium text-slate-400">admin@deviceflow.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
