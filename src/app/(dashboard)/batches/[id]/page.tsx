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
import DeviceDecisionSelector from "./DeviceDecisionSelector";
import BatchActionsClient from "./BatchActionsClient";

export default async function BatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  let batch: any = null;
  try {
    batch = await prisma.batch.findUnique({
      where: { id: resolvedParams.id },
      include: {
        trader: true,
        devices: { orderBy: { createdAt: "asc" } },
      },
    });
  } catch (error) {
    console.warn("Database connection failed. Using mock batch for preview.", error);
  }

  if (!batch) {
    // Generate a mock batch for testing purposes
    batch = {
      id: resolvedParams.id,
      date: new Date(),
      createdAt: new Date(),
      status: "OPEN",
      trader: { name: "تاجر افتراضي" },
      devices: [
        {
          id: "mock-device-1",
          brand: "شاشة سامسونج",
          model: "UA55TU7000UXUM",
          type: "شاشات",
          serialNumber: "55TU7000MOCK1",
          condition: "USED",
          cartonStatus: "DAMAGED",
          accessoriesStatus: "كامل ملحقاته",
          inspectionResult: "NOT_MATCH",
          faultType: "مكسور",
          defectType: "كسر في الزاوية العلوية اليسرى",
          decision: "IN_WORKSHOP",
          notes: "شاشة مرتجعة من العميل بها كسر بالبنل الداخلي والزجاج الخارجي سليم",
          inspectionDate: new Date(),
        },
        {
          id: "mock-device-2",
          brand: "مكيف جري",
          model: "GWC18QD",
          type: "مكيفات",
          serialNumber: "GRY18QDMOCK2",
          condition: "NEW",
          cartonStatus: "GOOD",
          accessoriesStatus: "بدون ملحقات",
          inspectionResult: "MATCH",
          faultType: "يعمل (لا يوجد عطل)",
          defectType: null,
          decision: "ACCEPT",
          notes: "الجهاز سليم تماما وتم قبوله ودخوله للمخازن مباشرة",
          inspectionDate: new Date(),
        }
      ],
    };
  }

  const matchCount = batch.devices.filter((d: any) => d.inspectionResult === "MATCH").length;
  const notMatchCount = batch.devices.filter((d: any) => d.inspectionResult === "NOT_MATCH").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
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
              تفاصيل الإذن وجميع البنود المسجلة والمستلمة
            </p>
          </div>
        </div>

        {/* Client Share & Print Buttons */}
        <BatchActionsClient 
          batchId={batch.id} 
          traderName={batch.trader.name} 
          reportNumber={batch.reportNumber} 
          representative={batch.representative}
          devices={batch.devices}
        />
      </div>

      {/* Batch Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">العميل / التاجر</p>
              <p className="font-bold text-gray-900">{batch.trader.name}</p>
            </div>
          </div>

          {/* رقم البلاغ */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Hash className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">رقم البلاغ</p>
              <p className="font-bold text-gray-900">{batch.reportNumber || "—"}</p>
            </div>
          </div>

          {/* اسم المندوب */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">المندوب</p>
              <p className="font-bold text-gray-900">{batch.representative || "—"}</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
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
            {batch.devices.map((device: any, index: number) => (
              <div key={device.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    {index + 1}
                  </div>

                  {/* Device Media */}
                  {device.mediaUrls && device.mediaUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {device.mediaUrls.map((url: string, imgIdx: number) => (
                        url.match(/\.(mp4|webm|mov|x-m4v)$/i) ? (
                          <video key={imgIdx} src={url} controls className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0" />
                        ) : (
                          <a key={imgIdx} href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={`صورة ${device.brand} ${device.model}`}
                              className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </a>
                        )
                      ))}
                    </div>
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

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-xs text-gray-500 block">رقم السيريال</span>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                          {device.serialNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">الفاحص المسؤول</span>
                        <span className="font-bold text-gray-700">{device.inspectorName || "غير محدد"}</span>
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
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">القرار / الحالة</span>
                        <DeviceDecisionSelector
                          deviceId={device.id}
                          currentDecision={device.decision}
                          batchId={batch.id}
                          isClosed={batch.status === "CLOSED"}
                        />
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
      <div className="text-center print:hidden">
        <Link
          href="/batches"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لسجل الأذونات
        </Link>
      </div>

      {/* القالب المخصص للطباعة فقط - بيان استلام المندوب */}
      <div className="hidden print:block text-right text-black font-sans p-4" dir="rtl">
        {/* ترويسة البيان */}
        <div className="text-center space-y-2 border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold">مؤسسة عاصمة المجد الفنية لإدارة الأجهزة</h1>
          <h2 className="text-lg font-bold text-gray-700">بيان استلام ومعاينة أجهزة من مندوب</h2>
          <p className="text-sm">تاريخ استخراج التقرير: {new Date().toLocaleString("ar-SA")}</p>
        </div>

        {/* بيانات الإذن والعميل */}
        <div className="grid grid-cols-2 gap-4 border border-black p-4 rounded-lg mb-6 text-sm">
          <div>
            <span className="font-bold block">العميل / التاجر:</span>
            <span>{batch.trader.name}</span>
          </div>
          <div>
            <span className="font-bold block">تاريخ الاستلام الفعلي:</span>
            <span>{new Date(batch.date).toLocaleDateString("ar-SA")}</span>
          </div>
          <div>
            <span className="font-bold block">رقم البلاغ / المرجع:</span>
            <span>{batch.reportNumber || "—"}</span>
          </div>
          <div>
            <span className="font-bold block">اسم المندوب المسلّم:</span>
            <span>{batch.representative || "—"}</span>
          </div>
          <div>
            <span className="font-bold block">رقم الإذن في النظام:</span>
            <span className="font-mono">{batch.id.substring(batch.id.length - 6).toUpperCase()}</span>
          </div>
          <div>
            <span className="font-bold block">إجمالي عدد الأجهزة:</span>
            <span>{batch.devices.length} جهاز</span>
          </div>
        </div>

        {/* جدول الأجهزة */}
        <h3 className="text-md font-bold mb-3 border-r-4 border-black pr-2">الأصناف والأجهزة المستلمة:</h3>
        <table className="min-w-full border-collapse border border-black text-xs text-right mb-8">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black px-2 py-1.5 w-8 text-center">#</th>
              <th className="border border-black px-2 py-1.5">البراند والموديل</th>
              <th className="border border-black px-2 py-1.5">رقم السيريال (Barcode)</th>
              <th className="border border-black px-2 py-1.5">حالة المطابقة والفحص</th>
              <th className="border border-black px-2 py-1.5">العطل / العيب الملاحظ</th>
              <th className="border border-black px-2 py-1.5">الفاحص المسؤول</th>
              <th className="border border-black px-2 py-1.5 w-24 text-center">صورة حالة الجهاز</th>
            </tr>
          </thead>
          <tbody>
            {batch.devices.map((device: any, index: number) => {
              const matchText = device.inspectionResult === "MATCH" ? "مطابق" : "غير مطابق";
              let decText = "قيد المعاينة";
              if (device.decision === "ACCEPT") decText = "مقبول";
              else if (device.decision === "IN_WORKSHOP") decText = "لدى الورشة";
              else if (device.decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE") decText = "مستلم بتعميد";
              else if (device.decision === "NON_COMPLIANT_NOT_RECEIVED") decText = "مرفوض لم يستلم";

              return (
                <tr key={device.id} className="border-b border-black">
                  <td className="border border-black px-2 py-1.5 text-center">{index + 1}</td>
                  <td className="border border-black px-2 py-1.5 font-bold">{device.brand} - {device.model}</td>
                  <td className="border border-black px-2 py-1.5 font-mono">{device.serialNumber}</td>
                  <td className="border border-black px-2 py-1.5">
                    {matchText} ({decText})
                  </td>
                  <td className="border border-black px-2 py-1.5">
                    {device.faultType || "سليم"} {device.notes ? `- ${device.notes}` : ""}
                  </td>
                  <td className="border border-black px-2 py-1.5">{device.inspectorName || "غير محدد"}</td>
                  <td className="border border-black px-2 py-1.5 text-center">
                    {device.mediaUrls && device.mediaUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {device.mediaUrls.slice(0, 2).map((url: string, mIdx: number) => (
                           url.match(/\.(mp4|webm|mov|x-m4v)$/i) ? (
                             <span key={mIdx} className="text-[10px] bg-gray-200 px-1 rounded">فيديو</span>
                           ) : (
                             <img
                               key={mIdx}
                               src={url}
                               alt="صورة حالة الجهاز"
                               className="max-h-12 max-w-16 rounded object-cover mx-auto"
                             />
                           )
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">لا يوجد صورة</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* قسم التوقيعات */}
        <div className="grid grid-cols-2 gap-12 mt-12 pt-6 border-t border-dashed border-gray-400">
          <div className="text-center space-y-8">
            <p className="font-bold">توقيع المندوب المسلّم</p>
            <p className="text-gray-400">________________________</p>
            <p className="text-xs">الاسم والتوقيع: .......................................</p>
          </div>
          <div className="text-center space-y-8">
            <p className="font-bold">توقيع الفاحص المسؤول</p>
            <p className="text-gray-400">________________________</p>
            <p className="text-xs">الاسم: {batch.devices[0]?.inspectorName || "......................................."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
