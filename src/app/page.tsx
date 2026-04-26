import { prisma } from "@/lib/prisma";
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Tags,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  // Fetch real statistics from database
  const totalDevices = await prisma.device.count();
  const matchedDevices = await prisma.device.count({ where: { inspectionResult: "MATCH" } });
  const notMatchedDevices = await prisma.device.count({ where: { inspectionResult: "NOT_MATCH" } });
  
  // Later this will be dynamic when DiscountWarehouse is built, for now just show NOT_MATCH as potential discount
  const discountPotential = notMatchedDevices; 

  const recentBatches = await prisma.batch.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      trader: { select: { name: true } },
      _count: { select: { devices: true } }
    }
  });

  const stats = [
    { name: "إجمالي الأجهزة المستلمة", value: totalDevices, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "الأجهزة المقبولة (مطابق)", value: matchedDevices, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { name: "الأجهزة المرفوضة (مرتجع)", value: notMatchedDevices, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    { name: "المستودع المخفّض", value: discountPotential, icon: Tags, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">نظرة عامة (Overview)</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>تحديث مباشر</span>
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
            <h2 className="text-lg font-medium text-gray-900">أحدث أذونات الاستلام (Batches)</h2>
            <Link href="/batches" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">عرض الكل &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الإذن</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">التاجر</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الأجهزة (الفعلي)</th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentBatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">لا يوجد أذونات استلام حالياً.</td>
                  </tr>
                ) : (
                  recentBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600">
                        <Link href={`/batches/${batch.id}`}>{batch.id.substring(batch.id.length - 6).toUpperCase()}</Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{batch.trader.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(batch.date).toLocaleDateString('ar-SA')}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">{batch._count.devices}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          batch.status === "CLOSED" ? "bg-green-100 text-green-800" : 
                          batch.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {batch.status === "CLOSED" ? "مكتمل" : batch.status === "IN_PROGRESS" ? "قيد الفحص" : "جديد"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Discount Warehouse Summary */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900">تصنيف المخفّض (قريباً)</h2>
          </div>
          <div className="p-6 opacity-60">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-green-600">فئة A (ممتاز)</span>
                  <span className="text-gray-500">0 جهاز</span>
                </div>
                <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: "0%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-amber-600">فئة B (جيد)</span>
                  <span className="text-gray-500">0 جهاز</span>
                </div>
                <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: "0%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-red-600">فئة C (اقتصادي)</span>
                  <span className="text-gray-500">0 جهاز</span>
                </div>
                <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-red-500" style={{ width: "0%" }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 rounded-lg bg-indigo-50 p-4 border border-indigo-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Tags className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-indigo-800">جاهز للبيع</h3>
                  <div className="mt-1 text-2xl font-semibold text-indigo-600">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
