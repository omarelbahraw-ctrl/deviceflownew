import { prisma } from "@/lib/prisma";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Tags,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { translations, Locale } from "@/lib/translations";

export const metadata: Metadata = {
  title: "عاصمة المجد - نظام إدارة الأجهزة والمستودع",
  description: "نظام لإدارة استلام وفحص الأجهزة والمستودع المخفّض",
};

export default async function Dashboard() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("deviceflow_lang")?.value as Locale) || "ar";
  const t = (key: keyof typeof translations["ar"]) => {
    const dict = translations[locale] || translations["ar"];
    return dict[key] || translations["ar"][key] || key;
  };
  const isRtl = locale === "ar";

  // Fetch real statistics from database
  let totalDevices = 0;
  let matchedDevices = 0;
  let notMatchedDevices = 0;
  let recentBatches: any[] = [];
  let catACount = 0;
  let catBCount = 0;
  let catCCount = 0;
  let activeTradersCount = 0;

  try {
    totalDevices = await prisma.device.count();
    matchedDevices = await prisma.device.count({ where: { inspectionResult: "MATCH" } });
    notMatchedDevices = await prisma.device.count({ where: { inspectionResult: "NOT_MATCH" } });
    recentBatches = await prisma.batch.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        trader: { select: { name: true } },
        _count: { select: { devices: true } }
      }
    });
    catACount = await prisma.discountWarehouse.count({ where: { category: "A" } });
    catBCount = await prisma.discountWarehouse.count({ where: { category: "B" } });
    catCCount = await prisma.discountWarehouse.count({ where: { category: "C" } });
    const activeTraders = await prisma.batch.groupBy({
      by: ["traderId"]
    });
    activeTradersCount = activeTraders.length;
  } catch (error) {
    console.warn("Database connection failed. Using mock stats for preview.", error);
  }
  
  const discountPotential = catACount + catBCount + catCCount; 

  const stats = [
    { name: t("dash_total_devices"), value: totalDevices, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { name: t("dash_matching"), value: matchedDevices, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { name: t("dash_not_matching"), value: notMatchedDevices, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    { name: t("wh_title"), value: discountPotential, icon: Tags, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{isRtl ? "نظرة عامة" : "Overview"}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{isRtl ? "تحديث مباشر" : "Live Updates"}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Batches & Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Recent Batches */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 p-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">{t("dash_recent_batches")}</h2>
            <Link href="/batches" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              {isRtl ? "عرض الكل ←" : "View All →"}
            </Link>
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className={`min-w-full divide-y divide-gray-200 ${isRtl ? "text-right" : "text-left"}`}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t("batch_id")}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t("batch_trader")}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t("batch_date")}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t("batch_devices_count")}</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t("batch_status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentBatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">{t("dash_no_batches")}</td>
                  </tr>
                ) : (
                  recentBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600">
                        <Link href={`/batches/${batch.id}`}>{batch.id.substring(batch.id.length - 6).toUpperCase()}</Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{batch.trader.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(batch.date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">{batch._count.devices}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          batch.status === "CLOSED" ? "bg-green-100 text-green-800" : 
                          batch.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {batch.status === "CLOSED" ? t("batch_save_success") : batch.status === "IN_PROGRESS" ? t("dash_status_in_progress") : t("dash_status_open")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {recentBatches.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">{t("dash_no_batches")}</div>
            ) : (
              recentBatches.map((batch) => (
                <div key={batch.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/batches/${batch.id}`} className="text-sm font-bold text-indigo-600 mb-1 inline-block">
                        #{batch.id.substring(batch.id.length - 6).toUpperCase()}
                      </Link>
                      <h3 className="text-sm font-bold text-gray-900">{batch.trader.name}</h3>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      batch.status === "CLOSED" ? "bg-green-100 text-green-800" : 
                      batch.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {batch.status === "CLOSED" ? t("batch_save_success") : batch.status === "IN_PROGRESS" ? t("dash_status_in_progress") : t("dash_status_open")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(batch.date).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                      <Package className="h-3.5 w-3.5" />
                      {batch._count.devices} {isRtl ? "أجهزة" : "Devices"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discount Warehouse Summary */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900">{isRtl ? "تصنيفات المستودع المخفض" : "Discount Warehouse Grades"}</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Category A */}
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-green-600">{t("wh_grade_a")}</span>
                  <span className="text-gray-500 font-bold">{catACount} {isRtl ? "جهاز" : "items"}</span>
                </div>
                <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-2 rounded-full bg-green-500" 
                    style={{ width: `${discountPotential > 0 ? (catACount / discountPotential) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Category B */}
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-amber-600">{t("wh_grade_b")}</span>
                  <span className="text-gray-500 font-bold">{catBCount} {isRtl ? "جهاز" : "items"}</span>
                </div>
                <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-2 rounded-full bg-amber-500" 
                    style={{ width: `${discountPotential > 0 ? (catBCount / discountPotential) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Category C */}
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-red-600">{t("wh_grade_c")}</span>
                  <span className="text-gray-500 font-bold">{catCCount} {isRtl ? "جهاز" : "items"}</span>
                </div>
                <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-2 rounded-full bg-red-500" 
                    style={{ width: `${discountPotential > 0 ? (catCCount / discountPotential) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 rounded-lg bg-indigo-50 p-4 border border-indigo-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tags className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
                <div className={isRtl ? "mr-3" : "ml-3"}>
                  <h3 className="text-sm font-medium text-indigo-800">{isRtl ? "إجمالي المخفض" : "Total Discount Stock"}</h3>
                  <div className="mt-1 text-2xl font-semibold text-indigo-600">{discountPotential}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
