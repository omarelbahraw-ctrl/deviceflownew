import { ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTrader } from "../actions";
import { redirect } from "next/navigation";

export default async function NewTraderPage() {
  const traders = await prisma.trader.findMany({ select: { representative: true } });
  const uniqueReps = Array.from(
    new Set(traders.map((t) => t.representative).filter(Boolean))
  ) as string[];

  async function handleCreate(formData: FormData) {
    "use server";
    const res = await createTrader(formData);
    if (!res?.error) {
      redirect("/traders");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/traders"
          className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-indigo-50 text-gray-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-indigo-600" />
            إضافة تاجر جديد
          </h1>
          <p className="text-sm text-gray-500 mt-1">أدخل بيانات التاجر أو العميل الجديد</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
        <form action={handleCreate} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">اسم التاجر أو الشركة *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="مثال: مؤسسة الأجهزة الحديثة"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف *</label>
            <input
              type="text"
              name="phone"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="05XXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">اسم المسئول</label>
            <input
              type="text"
              name="contactPerson"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="اسم الشخص المسئول"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">المندوب التابع له</label>
            <input
              type="text"
              name="representative"
              list="repsList"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="اختر من القائمة أو اكتب اسماً جديداً"
            />
            <datalist id="repsList">
              {uniqueReps.map((rep) => (
                <option key={rep} value={rep} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="email@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            حفظ بيانات التاجر
          </button>
        </form>
      </div>
    </div>
  );
}
