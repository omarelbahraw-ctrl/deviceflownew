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
  Settings,
  ClipboardList,
  Cpu
} from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "@/components/layout/LanguageContext";

const navigation = [
  { nameKey: "nav_dashboard" as const, href: "/", icon: LayoutDashboard },
  { nameKey: "nav_new_batch" as const, href: "/batches/new", icon: PlusCircle },
  { nameKey: "nav_batches" as const, href: "/batches", icon: FileText },
  { nameKey: "nav_reports_general" as const, href: "/reports", icon: ClipboardList },
  { nameKey: "nav_reports_traders" as const, href: "/reports/traders", icon: FileText },
  { nameKey: "nav_spare_parts" as const, href: "/spare-parts", icon: Cpu },
  { nameKey: "nav_discount_warehouse" as const, href: "/discount-warehouse", icon: Tags },
  { nameKey: "nav_settings" as const, href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { locale, setLocale, t, isRtl } = useTranslation();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
      <div className="flex h-16 shrink-0 items-center justify-between px-4 bg-slate-950">
        <div className="flex items-center min-w-0">
          <Package className={clsx("h-7 w-7 text-indigo-500 flex-shrink-0", isRtl ? "ml-2" : "mr-2")} />
          <span className="text-md font-bold tracking-tight text-white truncate">{t("brand_name")}</span>
        </div>
        <button
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all cursor-pointer flex-shrink-0"
        >
          {t("lang_toggle")}
        </button>
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
                key={item.nameKey}
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
                    "h-6 w-6 flex-shrink-0 transition-colors duration-200",
                    isRtl ? "ml-3" : "mr-3"
                  )}
                  aria-hidden="true"
                />
                {t(item.nameKey)}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center">
          <div>
            <p className="text-sm font-medium text-white">{t("brand_name")}</p>
            <p className="text-xs font-medium text-slate-400">admin@capitalofglory.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
