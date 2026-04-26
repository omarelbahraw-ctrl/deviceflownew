import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  User, 
  Phone, 
  Mail, 
  UserCheck, 
  Calendar,
  Package,
  ArrowRight,
  MonitorSmartphone,
  CheckCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const trader = await prisma.trader.findUnique({
    where: { id: resolvedParams.id },
    include: {
      batches: {
        orderBy: { date: "desc" },
        include: {
          items: true,
          _count: { select: { devices: true } }
        }
      },
      _count: {
        select: { devices: true }
      }
    }
  });

  if (!trader) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/traders" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">ملف التاجر</h1>
      </div>

      {/* Trader Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 h-24"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between">
            <div className="-mt-12 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-24 w-24">
              <User className="h-12 w-12 text-indigo-500" />
            </div>
            <div className="mt-4 text-right">
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                <MonitorSmartphone className="h-4 w-4" />
                إجمالي الأجهزة: {trader._count.devices}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">{trader.name}</h2>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">رقم المؤسسة</p>
                  <p className="text-base font-semibold text-gray-900" dir="ltr">{trader.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">المسئول</p>
                  <p className="text-base font-semibold text-gray-900">{trader.contactPerson || "غير محدد"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">مندوبنا</p>
                  <p className="text-base font-semibold text-gray-900">{trader.representative || "غير محدد"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">تاريخ الإضافة</p>
                  <p className="text-base font-semibold text-gray-900">{new Date(trader.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batches History */}
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
        <Package className="h-6 w-6 text-indigo-600" />
        أذونات الاستلام السابقة
      </h3>
      
      {trader.batches.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
          لا يوجد أذونات استلام لهذا التاجر حتى الآن.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trader.batches.map(batch => (
            <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="bg-slate-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">رقم الإذن</span>
                  <span className="text-sm font-bold text-indigo-700 font-mono">{batch.id}</span>
                </div>
                <div className="text-left">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                    batch.status === "CLOSED" ? "bg-green-100 text-green-800" :
                    batch.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {batch.status === "CLOSED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {batch.status === "CLOSED" ? "مكتمل" : batch.status === "IN_PROGRESS" ? "قيد الفحص" : "جديد / مفتوح"}
                  </span>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(batch.date).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">الأصناف المتوقع استلامها</h4>
                {batch.items.length === 0 ? (
                  <p className="text-sm text-gray-400">لم يتم تحديد أصناف في هذا الإذن.</p>
                ) : (
                  <ul className="space-y-3">
                    {batch.items.map(item => (
                      <li key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
                            <MonitorSmartphone className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.deviceType} - {item.brand}</p>
                            <p className="text-xs text-gray-500">الموديل: {item.model}</p>
                          </div>
                        </div>
                        <div className="text-center bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                          <span className="block text-xs text-indigo-500">العدد</span>
                          <span className="block font-bold text-indigo-700">{item.expectedQuantity}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  تم استلام <span className="font-bold text-gray-900">{batch._count.devices}</span> جهاز فعلياً
                </div>
                <Link href={`/batches/${batch.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  عرض تفاصيل الإذن &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
