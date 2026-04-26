import { prisma } from "@/lib/prisma";
import {
  Package,
  Plus,
  Calendar,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Hash,
  User,
} from "lucide-react";
import Link from "next/link";
import { deleteBatch } from "./actions";

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      trader: { select: { name: true } },
      _count: { select: { devices: true, items: true } },
    },
  });

  // Stats
  const totalBatches = batches.length;
  const openBatches = batches.filter((b) => b.status === "OPEN" || b.status === "IN_PROGRESS").length;
  const closedBatches = batches.filter((b) => b.status === "CLOSED").length;
  const totalDevices = batches.reduce((sum, b) => sum + b._count.devices, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            سجل الأذونات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            جميع أذونات الاستلام والفحص المسجلة في النظام
          </p>
        </div>
        <Link
          href="/batches/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" /> إذن استلام جديد
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الأذونات</p>
              <p className="text-xl font-bold text-gray-900">{totalBatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">أذونات مفتوحة</p>
              <p className="text-xl font-bold text-amber-600">{openBatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">أذونات مكتملة</p>
              <p className="text-xl font-bold text-green-600">{closedBatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الأجهزة</p>
              <p className="text-xl font-bold text-blue-600">{totalDevices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Hash className="h-5 w-5 text-gray-400" />
            قائمة الأذونات
          </h2>
          <span className="text-sm text-gray-500">{totalBatches} إذن</span>
        </div>

        {batches.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد أذونات بعد</h3>
            <p className="text-sm text-gray-500 mb-6">قم بفتح أول إذن استلام لبدء تسجيل الأجهزة.</p>
            <Link
              href="/batches/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" /> فتح إذن جديد
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">رقم الإذن</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">العميل / التاجر</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">التاريخ والوقت</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">عدد الأجهزة</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">الحالة</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* رقم الإذن */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/batches/${batch.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        {batch.id.substring(batch.id.length - 6).toUpperCase()}
                      </Link>
                    </td>

                    {/* العميل */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">{batch.trader.name}</span>
                      </div>
                    </td>

                    {/* التاريخ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="block font-medium">{new Date(batch.date).toLocaleDateString("ar-SA")}</span>
                          <span className="block text-xs text-gray-400">
                            {new Date(batch.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* عدد الأجهزة */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-9 min-w-[2.5rem] px-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg border border-blue-100">
                        {batch._count.devices}
                      </span>
                    </td>

                    {/* الحالة */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          batch.status === "CLOSED"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : batch.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {batch.status === "CLOSED" ? (
                          <><CheckCircle className="h-3.5 w-3.5" /> مكتمل</>
                        ) : batch.status === "IN_PROGRESS" ? (
                          <><Clock className="h-3.5 w-3.5" /> قيد الفحص</>
                        ) : (
                          <><AlertCircle className="h-3.5 w-3.5" /> جديد</>
                        )}
                      </span>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/batches/${batch.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">تفاصيل</span>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteBatch(batch.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            title="حذف الإذن"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">حذف</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
