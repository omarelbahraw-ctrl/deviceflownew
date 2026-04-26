import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Camera,
  Hash,
} from "lucide-react";

export default async function BatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const batch = await prisma.batch.findUnique({
    where: { id: resolvedParams.id },
    include: {
      trader: true,
      devices: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!batch) notFound();

  const matchCount = batch.devices.filter((d) => d.inspectionResult === "MATCH").length;
  const notMatchCount = batch.devices.filter((d) => d.inspectionResult === "NOT_MATCH").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/batches"
          className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-indigo-50 text-gray-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            إذن رقم:{" "}
            <span className="text-indigo-600 font-mono">
              {batch.id.substring(batch.id.length - 6).toUpperCase()}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            تفاصيل الإذن وجميع البنود المسجلة
          </p>
        </div>
      </div>

      {/* Batch Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">العميل / التاجر</p>
              <p className="font-bold text-gray-900">{batch.trader.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">التاريخ والوقت</p>
              <p className="font-bold text-gray-900">
                {new Date(batch.date).toLocaleDateString("ar-SA")}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(batch.createdAt).toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">عدد البنود</p>
              <p className="font-bold text-gray-900 text-xl">{batch.devices.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                batch.status === "CLOSED"
                  ? "bg-green-100"
                  : "bg-amber-100"
              }`}
            >
              {batch.status === "CLOSED" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">حالة الإذن</p>
              <p
                className={`font-bold ${
                  batch.status === "CLOSED" ? "text-green-600" : "text-amber-600"
                }`}
              >
                {batch.status === "CLOSED" ? "مكتمل ومحفوظ" : "جديد / مفتوح"}
              </p>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold border border-green-100">
            <CheckCircle className="h-4 w-4" /> مطابق: {matchCount}
          </div>
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-bold border border-red-100">
            <AlertCircle className="h-4 w-4" /> غير مطابق: {notMatchCount}
          </div>
        </div>
      </div>

      {/* Devices / Items List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Hash className="h-5 w-5 text-gray-400" />
            بنود الإذن ({batch.devices.length} بند)
          </h2>
        </div>

        {batch.devices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">لا توجد بنود مسجلة في هذا الإذن.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {batch.devices.map((device, index) => (
              <div key={device.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    {index + 1}
                  </div>

                  {/* Device Image */}
                  {device.imageBase64 && (
                    <img
                      src={device.imageBase64}
                      alt={`صورة ${device.brand} ${device.model}`}
                      className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                  )}

                  {/* Device Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {device.brand} - {device.model}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {device.type}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          device.inspectionResult === "MATCH"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : device.inspectionResult === "NOT_MATCH"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {device.inspectionResult === "MATCH"
                          ? "✅ مطابق"
                          : device.inspectionResult === "NOT_MATCH"
                          ? "❌ غير مطابق"
                          : "⏳ قيد المراجعة"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-xs text-gray-500 block">رقم السيريال</span>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                          {device.serialNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">العطل</span>
                        <span className="font-bold text-gray-800">{device.faultType || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">الملحقات</span>
                        <span className="font-bold text-gray-800">
                          {device.accessoriesStatus || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">تاريخ الفحص</span>
                        <span className="font-bold text-gray-800">
                          {device.inspectionDate
                            ? new Date(device.inspectionDate).toLocaleDateString("ar-SA")
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {device.notes && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                        <p className="text-xs font-bold text-amber-700 mb-1">📝 ملاحظات الفحص:</p>
                        <p className="text-sm text-amber-900">{device.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to List */}
      <div className="text-center">
        <Link
          href="/batches"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لسجل الأذونات
        </Link>
      </div>
    </div>
  );
}
