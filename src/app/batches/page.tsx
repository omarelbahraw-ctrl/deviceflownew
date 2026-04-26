import { prisma } from "@/lib/prisma";
import { Package, Plus, Calendar, Trash2, ChevronLeft, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { createBatch, deleteBatch } from "./actions";

export default async function BatchesPage() {
  // Fetch batches with trader names and device counts
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      trader: { select: { name: true } },
      _count: { select: { devices: true, items: true } },
    },
  });

  // Fetch traders to populate the dropdown for creating a new batch
  const traders = await prisma.trader.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-indigo-600" />
          أذونات الاستلام
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* أزرار العمليات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit p-6 flex flex-col items-center text-center space-y-4">
           <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
             <Plus className="h-8 w-8" />
           </div>
           <h2 className="text-xl font-bold text-gray-800">إضافة أجهزة جديدة</h2>
           <p className="text-sm text-gray-500">قم بتحديد العميل ومسح الأجهزة مباشرة في خطوة واحدة سريعة.</p>
           
           <Link 
             href="/batches/new" 
             className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors mt-2"
           >
             <Plus className="h-5 w-5" /> بدء الاستلام والفحص الآن
           </Link>
        </div>

        {/* قائمة الأذونات */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">قائمة أذونات الاستلام</h2>
          </div>
          {batches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              لا يوجد أذونات استلام حالياً. قم بفتح إذن جديد للبدء.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <li key={batch.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/batches/${batch.id}`} className="text-md font-bold text-indigo-700 hover:underline">
                        إذن رقم: {batch.id.substring(batch.id.length - 6).toUpperCase()}
                      </Link>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-700">{batch.trader.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(batch.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* الحالة */}
                      <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                        batch.status === "CLOSED" ? "bg-green-100 text-green-800" :
                        batch.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {batch.status === "CLOSED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {batch.status === "CLOSED" ? "مكتمل" : batch.status === "IN_PROGRESS" ? "قيد الفحص" : "جديد"}
                      </span>

                      <div className="text-center hidden md:block bg-gray-50 px-3 py-1 rounded border border-gray-100">
                        <span className="block text-xs text-gray-500">أصناف متوقعة</span>
                        <span className="block text-sm font-bold text-gray-800">{batch._count.items}</span>
                      </div>
                      
                      <div className="text-center hidden md:block bg-indigo-50 px-3 py-1 rounded border border-indigo-100">
                        <span className="block text-xs text-indigo-500">استلام فعلي</span>
                        <span className="block text-sm font-bold text-indigo-700">{batch._count.devices}</span>
                      </div>
                      
                      <div className="flex items-center border-r border-gray-200 pr-4 mr-2">
                        <Link 
                          href={`/batches/${batch.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="عرض تفاصيل الإذن"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteBatch(batch.id);
                        }}>
                          <button 
                            type="submit" 
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف الإذن"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
