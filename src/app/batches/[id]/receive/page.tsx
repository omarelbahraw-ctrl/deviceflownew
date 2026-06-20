import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MonitorSmartphone, QrCode, ClipboardCheck, AlertTriangle } from "lucide-react";
import { receiveDevice } from "./actions";
import { cookies } from "next/headers";
import { translations, Locale } from "@/lib/translations";

export default async function ReceiveDevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const locale = (cookieStore.get("deviceflow_lang")?.value as Locale) || "ar";
  const t = (key: keyof typeof translations["ar"]) => {
    const dict = translations[locale] || translations["ar"];
    return dict[key] || translations["ar"][key] || key;
  };
  const isRtl = locale === "ar";

  const batch = await prisma.batch.findUnique({
    where: { id: resolvedParams.id },
    include: {
      trader: true,
      items: true,
      devices: { orderBy: { createdAt: "desc" }, take: 5 }, // عرض أحدث 5 أجهزة تم استلامها
    },
  });

  if (!batch) notFound();

  // Fault Types as requested by user
  const FAULT_TYPES = isRtl
    ? ["يعمل (لا يوجد عطل)", "لا يعمل نهائياً", "مكسور", "خط في الشاشة", "دوت (نقطة)", "عطل بانل", "أخرى"]
    : ["Working (No Fault)", "Not Working at All", "Broken", "Line on Screen", "Pixel Dot", "Panel Fault", "Other"];

  if (batch.status === "CLOSED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4" dir={isRtl ? "rtl" : "ltr"}>
        <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{isRtl ? "عفواً، هذا الإذن مغلق!" : "Sorry, this batch is closed!"}</h1>
        <p className="text-gray-500 max-w-md">{isRtl ? "لا يمكنك إضافة أجهزة جديدة أو إجراء فحص لأن الإذن تم إغلاقه حفظاً للبيانات. يرجى مراجعة مدير النظام إذا كنت بحاجة للتعديل." : "You cannot add new devices or perform inspection because the batch was closed for data integrity. Please consult the system administrator if modifications are required."}</p>
        <Link href={`/batches/${batch.id}`} className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">
          <ArrowRight className="h-4 w-4" /> {isRtl ? "العودة لتفاصيل الإذن" : "Back to Batch Details"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/batches/${batch.id}`} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("rec_title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRtl ? "إذن رقم:" : "Receipt ID:"} <span className="font-mono text-indigo-600">{batch.id.substring(batch.id.length - 6).toUpperCase()}</span> | {isRtl ? "التاجر:" : "Trader:"} {batch.trader.name}
            </p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg text-center">
          <span className="block text-xs text-indigo-600 font-semibold">{isRtl ? "إجمالي المستلم" : "Total Received"}</span>
          <span className="block text-xl font-bold text-indigo-800">{batch.devices.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* نموذج فحص الجهاز (أخذ مساحة أكبر) */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-900 border-b border-gray-800 p-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-400" />
              {isRtl ? "فحص جهاز جديد" : "Inspect New Device"}
            </h2>
          </div>
          <form action={async (formData) => {
            "use server";
            await receiveDevice(formData);
          }} className="p-6">
            <input type="hidden" name="batchId" value={batch.id} />
            <input type="hidden" name="traderId" value={batch.trader.id} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* القسم الأول: البيانات الأساسية */}
              <div className="space-y-5">
                <h3 className="text-md font-bold text-gray-800 border-b pb-2">{isRtl ? "البيانات الأساسية" : "Basic Information"}</h3>
                
                <div>
                  <label htmlFor="batchItemId" className="block text-sm font-bold text-gray-700 mb-1">{t("rec_match_expected")}</label>
                  <select
                    id="batchItemId"
                    name="batchItemId"
                    required
                    className="block w-full rounded-md border-2 border-indigo-100 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-0 sm:text-sm bg-indigo-50/30 font-medium"
                  >
                    <option value="">{t("rec_select_item")}</option>
                    {batch.items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.deviceType} - {item.brand} ({item.model})
                      </option>
                    ))}
                  </select>
                  {batch.items.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">{t("rec_no_items_error")}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="serialNumber" className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    {isRtl ? "رقم السيريال (Serial Number) *" : "Serial Number (SN) *"}
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    id="serialNumber"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-lg font-mono tracking-widest uppercase bg-yellow-50"
                    placeholder={isRtl ? "قم بمسح الباركود هنا..." : "Scan barcode here..."}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">{isRtl ? "حالة الجهاز" : "Device Condition"}</label>
                    <select id="condition" name="condition" required className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
                      <option value="NEW">{isRtl ? "جديد (New)" : "New"}</option>
                      <option value="USED">{isRtl ? "مستعمل (Used)" : "Used"}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cartonStatus" className="block text-sm font-medium text-gray-700 mb-1">{isRtl ? "حالة الكرتون" : "Carton Condition"}</label>
                    <select id="cartonStatus" name="cartonStatus" required className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
                      <option value="GOOD">{isRtl ? "سليم" : "Intact"}</option>
                      <option value="DAMAGED">{isRtl ? "تالف" : "Damaged"}</option>
                      <option value="NONE">{isRtl ? "بدون كرتون" : "No Carton"}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="accessoriesStatus" className="block text-sm font-medium text-gray-700 mb-1">{t("new_batch_accessories")}</label>
                  <select id="accessoriesStatus" name="accessoriesStatus" required className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
                    <option value="كامل ملحقاته">{isRtl ? "كامل ملحقاته" : "Full Accessories"}</option>
                    <option value="غير كامل ملحقاته">{isRtl ? "غير كامل ملحقاته" : "Incomplete Accessories"}</option>
                    <option value="بدون ملحقات">{isRtl ? "بدون ملحقات" : "No Accessories"}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="discountCategory" className="block text-sm font-bold text-gray-700 mb-1">{t("rec_category")}</label>
                  <select id="discountCategory" name="discountCategory" required className="block w-full rounded-md border-2 border-indigo-100 px-3 py-2 bg-white text-gray-900 font-bold">
                    <option value="A">{t("rec_cat_a")}</option>
                    <option value="B">{t("rec_cat_b")}</option>
                    <option value="C">{t("rec_cat_c")}</option>
                  </select>
                </div>
              </div>

              {/* القسم الثاني: نتيجة الفحص */}
              <div className="space-y-5">
                <h3 className="text-md font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-indigo-500" />
                  {isRtl ? "نتيجة الفحص الفني" : "Technical Inspection Verdict"}
                </h3>

                <div>
                  <label htmlFor="inspectionResult" className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_result")}</label>
                  <select id="inspectionResult" name="inspectionResult" required className="block w-full rounded-md border border-gray-300 px-3 py-3 font-bold bg-white text-gray-900">
                    <option value="MATCH">{isRtl ? "✅ مطابق (يدخل المخزون العادي)" : "✅ Matching (Enters Regular Stock)"}</option>
                    <option value="NOT_MATCH">{isRtl ? "❌ غير مطابق (به عيوب أو مرتجع)" : "❌ Non-matching (Faulty / Return)"}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="faultType" className="block text-sm font-medium text-gray-700 mb-1">{isRtl ? "خانة العطل الرئيسي" : "Main Fault Category"}</label>
                  <select id="faultType" name="faultType" required className="block w-full rounded-md border border-gray-300 px-3 py-2 bg-white">
                    {FAULT_TYPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="defectType" className="block text-sm font-medium text-gray-700 mb-1">{isRtl ? "تفاصيل العيب (إن وجد)" : "Defect Details (if any)"}</label>
                  <input
                    type="text"
                    name="defectType"
                    id="defectType"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                    placeholder={t("rec_defect_placeholder")}
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">{isRtl ? "التقرير الفني وملاحظات إضافية" : "Tech Report & Additional Notes"}</label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none sm:text-sm"
                    placeholder={isRtl ? "اكتب أي ملاحظات أخرى هنا..." : "Write any other notes here..."}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <AlertTriangle className={`h-4 w-4 inline text-amber-500 ${isRtl ? "ml-1" : "mr-1"}`} />
                {isRtl ? "تأكد من قراءة السيريال بشكل صحيح." : "Make sure the serial is read correctly."}
              </div>
              <button
                type="submit"
                disabled={batch.items.length === 0}
                className="inline-flex justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                {t("rec_btn_save")}
              </button>
            </div>
          </form>
        </div>

        {/* أحدث الأجهزة المستلمة في هذا الإذن */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-slate-50 border-b border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MonitorSmartphone className="h-5 w-5 text-indigo-500" />
              {t("rec_latest_received")}
            </h2>
          </div>
          <div className="p-0">
            {batch.devices.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                {isRtl ? "لم يتم استلام أي جهاز في هذا الإذن بعد." : "No devices received in this batch yet."}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {batch.devices.map(device => (
                  <li key={device.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{device.type} - {device.brand}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{device.serialNumber}</p>
                        <p className="text-xs text-indigo-600 mt-1">{device.faultType}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        device.inspectionResult === "MATCH" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {device.inspectionResult === "MATCH" ? (isRtl ? "مطابق" : "Matching") : (isRtl ? "غير مطابق" : "Non-matching")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {batch.devices.length > 5 && (
              <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                <Link href={`/batches/${batch.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                  {isRtl ? "عرض كل الأجهزة \u2190" : "View all devices \u2192"}
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
