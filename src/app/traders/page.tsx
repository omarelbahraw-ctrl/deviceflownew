import { prisma } from "@/lib/prisma";
import { Users, Plus, Phone, Mail, Trash2, User, UserCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createTrader, deleteTrader } from "./actions";

export default async function TradersPage() {
  const traders = await prisma.trader.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { batches: true, devices: true },
      },
    },
  });

  const uniqueReps = Array.from(new Set(traders.map(t => t.representative).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          إدارة التجار
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* نموذج إضافة تاجر جديد */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-slate-50 border-b border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-500" />
              إضافة تاجر جديد
            </h2>
          </div>
          <form action={createTrader} className="p-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">اسم التاجر أو الشركة *</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="مثال: مؤسسة الأجهزة الحديثة"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">رقم الهاتف *</label>
              <input
                type="text"
                name="phone"
                id="phone"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="05XXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">اسم المسئول</label>
              <input
                type="text"
                name="contactPerson"
                id="contactPerson"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="اسم الشخص المسئول"
              />
            </div>
            <div>
              <label htmlFor="representative" className="block text-sm font-medium text-gray-700">المندوب التابع له</label>
              <input
                type="text"
                name="representative"
                id="representative"
                list="repsList"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="اختر من القائمة أو اكتب اسماً جديداً"
              />
              <datalist id="repsList">
                {uniqueReps.map((rep) => (
                  <option key={rep} value={rep} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="email@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              حفظ بيانات التاجر
            </button>
          </form>
        </div>

        {/* قائمة التجار */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">قائمة التجار المسجلين</h2>
          </div>
          {traders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              لا يوجد تجار مسجلين حالياً. قم بإضافة تاجر جديد للبدء.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {traders.map((trader) => (
                <li key={trader.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/traders/${trader.id}`} className="text-md font-bold text-indigo-700 hover:underline flex items-center gap-1">
                        {trader.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span dir="ltr">{trader.phone}</span>
                        </div>
                        {trader.contactPerson && (
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                            <User className="h-3.5 w-3.5 text-gray-500" />
                            <span>المسئول: {trader.contactPerson}</span>
                          </div>
                        )}
                        {trader.representative && (
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>المندوب: {trader.representative}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center hidden sm:block bg-gray-50 px-3 py-1 rounded border border-gray-100">
                        <span className="block text-xs text-gray-500">أذونات</span>
                        <span className="block text-sm font-bold text-gray-800">{trader._count.batches}</span>
                      </div>
                      <div className="text-center hidden sm:block bg-indigo-50 px-3 py-1 rounded border border-indigo-100">
                        <span className="block text-xs text-indigo-500">أجهزة</span>
                        <span className="block text-sm font-bold text-indigo-700">{trader._count.devices}</span>
                      </div>
                      <div className="flex items-center border-r border-gray-200 pr-4 mr-2">
                        <Link 
                          href={`/traders/${trader.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="عرض ملف العميل"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteTrader(trader.id);
                        }}>
                          <button 
                            type="submit" 
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف التاجر"
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
