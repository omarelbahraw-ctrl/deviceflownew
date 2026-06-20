import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Tags,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Hash,
  Package,
  DollarSign,
} from "lucide-react";

const GRADE_INFO: Record<string, { label: string; bg: string; text: string }> = {
  A: { label: "فئة A — ممتاز", bg: "bg-green-100", text: "text-green-700" },
  B: { label: "فئة B — جيد", bg: "bg-amber-100", text: "text-amber-700" },
  C: { label: "فئة C — اقتصادي", bg: "bg-red-100", text: "text-red-700" },
};

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  WORKING: { label: "يعمل بشكل كامل", color: "text-green-600" },
  MINOR_ISSUE: { label: "يعمل مع ملاحظة بسيطة", color: "text-amber-600" },
  NEEDS_REPAIR: { label: "يحتاج إصلاح إضافي", color: "text-red-600" },
};

export default async function DiscountItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const item = await prisma.discountWarehouse.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!item) notFound();

  const grade = GRADE_INFO[item.category] || GRADE_INFO.C;
  const status = STATUS_INFO[item.workingStatus] || STATUS_INFO.WORKING;
  const images = [item.image1, item.image2, item.image3].filter(Boolean) as string[];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/discount-warehouse"
          className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-indigo-50 text-gray-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="h-6 w-6 text-amber-600" />
            {item.brand} {item.model}
          </h1>
          <p className="text-sm text-gray-500 mt-1">تفاصيل الجهاز في المستودع المخفّض</p>
        </div>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className={`grid ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1`}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`صورة ${idx + 1}`}
                className={`w-full object-cover ${images.length === 1 ? "max-h-80" : "h-48"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grade & Status Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-sm font-bold px-4 py-2 rounded-full ${grade.bg} ${grade.text} border`}>
          {grade.label}
        </span>
        <span className={`text-sm font-bold ${status.color}`}>
          {item.workingStatus === "WORKING" ? <CheckCircle className="h-4 w-4 inline ml-1" /> : <AlertTriangle className="h-4 w-4 inline ml-1" />}
          {status.label}
        </span>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${item.readyForSale ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {item.readyForSale ? "✅ متاح للبيع" : "🔴 تم البيع"}
        </span>
      </div>

      {/* Device Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-400" /> بيانات الجهاز
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">البراند</p>
            <p className="font-bold text-gray-900">{item.brand || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">الموديل</p>
            <p className="font-bold text-gray-900">{item.model || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">النوع</p>
            <p className="font-bold text-gray-900">{item.type || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">رقم السيريال</p>
            <p className="font-mono font-bold text-indigo-600 text-sm">{item.serialNumber || "—"}</p>
          </div>
        </div>

        {item.accessories && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs font-bold text-blue-700 mb-1">🔌 الملحقات المتاحة</p>
            <p className="text-sm text-blue-900">{item.accessories}</p>
          </div>
        )}
      </div>

      {/* Repair Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-gray-400" /> تفاصيل الإصلاح
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="text-xs font-bold text-red-700 mb-1">⚠️ المشكلة السابقة</p>
            <p className="text-sm text-red-900">{item.previousIssue || "لم يتم تحديد مشكلة سابقة"}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-xs font-bold text-green-700 mb-1">✅ ما تم إصلاحه</p>
            <p className="text-sm text-green-900">{item.repairDone || "لم يتم تحديد تفاصيل الإصلاح"}</p>
          </div>
        </div>

        {item.displayNotes && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs font-bold text-amber-700 mb-1">📝 ملاحظات</p>
            <p className="text-sm text-amber-900">{item.displayNotes}</p>
          </div>
        )}
      </div>

      {/* Prices */}
      {(item.priceBefore || item.priceAfter || item.repairCost) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-400" /> الأسعار
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {item.priceBefore && (
              <div className="text-center bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">السعر الأصلي</p>
                <p className="text-xl font-bold text-gray-400 line-through">{item.priceBefore.toLocaleString()} ر.س</p>
              </div>
            )}
            {item.priceAfter && (
              <div className="text-center bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-xs text-green-600">سعر البيع</p>
                <p className="text-xl font-bold text-green-700">{item.priceAfter.toLocaleString()} ر.س</p>
              </div>
            )}
            {item.repairCost && (
              <div className="text-center bg-amber-50 rounded-lg p-4">
                <p className="text-xs text-amber-600">تكلفة الإصلاح</p>
                <p className="text-xl font-bold text-amber-700">{item.repairCost.toLocaleString()} ر.س</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back */}
      <div className="text-center">
        <Link
          href="/discount-warehouse"
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-800 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمستودع المخفّض
        </Link>
      </div>
    </div>
  );
}
