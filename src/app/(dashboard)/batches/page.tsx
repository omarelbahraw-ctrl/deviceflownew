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
import { cookies } from "next/headers";
import { translations, Locale } from "@/lib/translations";

export default async function BatchesPage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("deviceflow_lang")?.value as Locale) || "ar";
  const t = (key: keyof typeof translations["ar"]) => {
    const dict = translations[locale] || translations["ar"];
    return dict[key] || translations["ar"][key] || key;
  };
  const isRtl = locale === "ar";

  let batches: any[] = [];
  try {
    batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        trader: { select: { name: true } },
        _count: { select: { devices: true, items: true } },
      },
    });
  } catch (error) {
    console.warn("Database connection failed. Using mock batches for preview.", error);
  }

  // Stats
  const totalBatches = batches.length;
  const openBatches = batches.filter((b) => b.status === "OPEN" || b.status === "IN_PROGRESS").length;
  const closedBatches = batches.filter((b) => b.status === "CLOSED").length;
  const totalDevices = batches.reduce((sum, b) => sum + b._count.devices, 0);

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            {t("nav_batches")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRtl ? "جميع أذونات الاستلام والفحص المسجلة في النظام" : "All device receipt and inspection records registered in the system"}
          </p>
        </div>
        <Link
          href="/batches/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" /> {t("nav_new_batch")}
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
              <p className="text-xs text-gray-500">{isRtl ? "إجمالي الأذونات" : "Total Receipts"}</p>
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
              <p className="text-xs text-gray-500">{isRtl ? "أذونات مفتوحة" : "Open Receipts"}</p>
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
              <p className="text-xs text-gray-500">{isRtl ? "أذونات مكتملة" : "Closed Receipts"}</p>
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
              <p className="text-xs text-gray-500">{t("dash_total_devices")}</p>
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
            {isRtl ? "قائمة الأذونات" : "Receipt Batches"}
          </h2>
          <span className="text-sm text-gray-500">{totalBatches} {isRtl ? "إذن" : "Records"}</span>
        </div>

        {batches.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">{t("dash_no_batches")}</h3>
            <p className="text-sm text-gray-500 mb-6">{isRtl ? "قم بفتح أول إذن استلام لبدء تسجيل الأجهزة." : "Open your first receipt record to start registering devices."}</p>
            <Link
              href="/batches/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" /> {isRtl ? "فتح إذن جديد" : "Open New Batch"}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full ${isRtl ? "text-right" : "text-left"}`}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">{isRtl ? "رقم الإذن / البلاغ" : "Receipt ID / Report #"}</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">{t("batch_trader")}</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">{t("batch_rep")}</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">{isRtl ? "التاريخ والوقت" : "Date & Time"}</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">{t("batch_devices_count")}</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">{t("batch_status")}</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">{t("batch_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-indigo-50/30 transition-colors">
                    {/* رقم الإذن / البلاغ */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/batches/${batch.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors w-max"
                        >
                          <FileText className="h-4 w-4" />
                          {batch.id.substring(batch.id.length - 6).toUpperCase()}
                        </Link>
                        {batch.reportNumber && (
                          <span className="text-xs text-amber-600 font-bold px-1">
                            {isRtl ? "بلاغ:" : "Report:"} {batch.reportNumber}
                          </span>
                        )}
                      </div>
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

                    {/* المندوب */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{batch.representative || "—"}</span>
                    </td>

                    {/* التاريخ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="block font-medium">
                            {new Date(batch.date).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}
                          </span>
                          <span className="block text-xs text-gray-400">
                            {new Date(batch.createdAt).toLocaleTimeString(isRtl ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" })}
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
                          <><CheckCircle className="h-3.5 w-3.5" /> {isRtl ? "مكتمل" : "Closed"}</>
                        ) : batch.status === "IN_PROGRESS" ? (
                          <><Clock className="h-3.5 w-3.5" /> {t("dash_status_in_progress")}</>
                        ) : (
                          <><AlertCircle className="h-3.5 w-3.5" /> {t("dash_status_open")}</>
                        )}
                      </span>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/batches/${batch.id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          title={t("batch_btn_details")}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">{isRtl ? "تفاصيل" : "Details"}</span>
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
                            title={t("batch_btn_delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">{isRtl ? "حذف" : "Delete"}</span>
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
