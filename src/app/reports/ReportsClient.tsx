"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateDemoDevices } from "./actions";
import {
  FileText,
  Printer,
  Share2,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Loader2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  RotateCcw,
  FileCheck,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/layout/LanguageContext";
import clsx from "clsx";

interface ReportsClientProps {
  initialDevices: any[];
}

// Handled dynamically inside component to support translations

const DECISION_COLORS: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  ACCEPT: "bg-green-50 text-green-700 border-green-200",
  IN_WORKSHOP: "bg-blue-50 text-blue-700 border-blue-200",
  READY_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border-indigo-200",
  REPAIRED_AND_DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPAIRED_BUT_REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  REJECTED_AND_DELIVERY_REJECTED: "bg-red-50 text-red-700 border-red-200",
  NON_COMPLIANT_NOT_RECEIVED: "bg-orange-50 text-orange-700 border-orange-200",
  NON_COMPLIANT_RECEIVED_WITH_OVERRIDE: "bg-amber-50 text-amber-700 border-amber-200",
  RETURNED_COMPLIANT: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function ReportsClient({ initialDevices }: ReportsClientProps) {
  const router = useRouter();
  const { t, isRtl, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"IN_WORKSHOP" | "NON_COMPLIANT_NOT_RECEIVED" | "READY_FOR_DELIVERY" | "RETURNED_COMPLIANT" | "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE" | "ALL">("IN_WORKSHOP");
  const [selectedDecisionFilter, setSelectedDecisionFilter] = useState("ALL");
  const [generating, setGenerating] = useState(false);
  const [printDate, setPrintDate] = useState("");

  useEffect(() => {
    setPrintDate(new Date().toLocaleString(locale === "ar" ? "ar-SA" : "en-US"));
  }, [locale]);

  const DECISION_LABELS: Record<string, string> = isRtl ? {
    PENDING: "⏳ قيد الفحص/معلق",
    ACCEPT: "✅ مقبول",
    IN_WORKSHOP: "🔧 لدى الورشة",
    READY_FOR_DELIVERY: "📦 جاهز للتسليم",
    REPAIRED_AND_DELIVERED: "🤝 تم الاصلاح وتم التسليم",
    REPAIRED_BUT_REJECTED: "❌ تم الاصلاح ورفض الاستلام",
    REJECTED_AND_DELIVERY_REJECTED: "🚫 مرفوض رفض الاستلام",
    NON_COMPLIANT_NOT_RECEIVED: "⚠️ غير مطابق لم يتم الاستلام",
    NON_COMPLIANT_RECEIVED_WITH_OVERRIDE: "📝 غير مطابق تم الاستلام بتعميد",
    RETURNED_COMPLIANT: "🔄 مرتجع مطابق",
  } : {
    PENDING: "⏳ Under Inspection/Pending",
    ACCEPT: "✅ Accepted",
    IN_WORKSHOP: "🔧 In Workshop",
    READY_FOR_DELIVERY: "📦 Ready for Delivery",
    REPAIRED_AND_DELIVERED: "🤝 Repaired & Delivered",
    REPAIRED_BUT_REJECTED: "❌ Repaired but Rejected",
    REJECTED_AND_DELIVERY_REJECTED: "🚫 Rejected & Delivery Rejected",
    NON_COMPLIANT_NOT_RECEIVED: "⚠️ Non-compliant Not Received",
    NON_COMPLIANT_RECEIVED_WITH_OVERRIDE: "📝 Non-compliant Received with Override",
    RETURNED_COMPLIANT: "🔄 Returned Compliant",
  };

  // Statistics
  const workshopCount = initialDevices.filter(d => d.decision === "IN_WORKSHOP").length;
  const rejectedCount = initialDevices.filter(d => d.decision === "NON_COMPLIANT_NOT_RECEIVED").length;
  const readyCount = initialDevices.filter(d => d.decision === "READY_FOR_DELIVERY").length;
  const returnedCompliantCount = initialDevices.filter(d => d.decision === "RETURNED_COMPLIANT").length;
  const compliantOverrideCount = initialDevices.filter(d => d.decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE").length;
  const totalCount = initialDevices.length;

  // Filter devices based on tab
  let tabDevices = initialDevices;
  if (activeTab === "IN_WORKSHOP") {
    tabDevices = initialDevices.filter(d => d.decision === "IN_WORKSHOP");
  } else if (activeTab === "NON_COMPLIANT_NOT_RECEIVED") {
    tabDevices = initialDevices.filter(d => d.decision === "NON_COMPLIANT_NOT_RECEIVED");
  } else if (activeTab === "READY_FOR_DELIVERY") {
    tabDevices = initialDevices.filter(d => d.decision === "READY_FOR_DELIVERY");
  } else if (activeTab === "RETURNED_COMPLIANT") {
    tabDevices = initialDevices.filter(d => d.decision === "RETURNED_COMPLIANT");
  } else if (activeTab === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE") {
    tabDevices = initialDevices.filter(d => d.decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE");
  } else {
    // For the "ALL" tab, check specific decision filter dropdown
    if (selectedDecisionFilter !== "ALL") {
      tabDevices = initialDevices.filter(d => d.decision === selectedDecisionFilter);
    }
  }

  // Filter based on search query (Serial, model, brand, trader)
  const filteredDevices = tabDevices.filter(d => {
    const term = searchQuery.toLowerCase();
    if (!term) return true;
    return (
      d.serialNumber?.toLowerCase().includes(term) ||
      d.model?.toLowerCase().includes(term) ||
      d.brand?.toLowerCase().includes(term) ||
      d.trader?.name?.toLowerCase().includes(term) ||
      d.inspectorName?.toLowerCase().includes(term)
    );
  });

  // Handle demo generation
  const handleGenerateDemo = async () => {
    setGenerating(true);
    const res = await generateDemoDevices();
    setGenerating(false);
    if (res.success) {
      alert(isRtl ? "تم توليد الأجهزة التجريبية بنجاح بنظام رقم البلاغ التلقائي! تم إنشاء إذن استلام جديد يحتوي على 3 أجهزة فحص موزعة." : "Demo devices generated successfully! A new receipt batch with 3 inspected devices has been created.");
      router.refresh();
    } else {
      alert((isRtl ? "خطأ أثناء التوليد: " : "Generation error: ") + res.error);
    }
  };

  // Generate share message text
  const getShareText = () => {
    let tabName = isRtl ? "تقرير الأجهزة لدى الورشة 🔧" : "Workshop Devices Report 🔧";
    if (activeTab === "NON_COMPLIANT_NOT_RECEIVED") tabName = isRtl ? "تقرير الأجهزة غير المطابقة والمرفوضة ⚠️" : "Non-compliant/Rejected Devices Report ⚠️";
    if (activeTab === "READY_FOR_DELIVERY") tabName = isRtl ? "تقرير الأجهزة الجاهزة للتسليم 📦" : "Ready for Delivery Report 📦";
    if (activeTab === "RETURNED_COMPLIANT") tabName = isRtl ? "تقرير الأجهزة المرتجعة المطابقة 🔄" : "Returned Compliant Devices Report 🔄";
    if (activeTab === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE") tabName = isRtl ? "تقرير الأجهزة غير المطابقة المستلمة بتعميد 📝" : "Non-compliant Received with Override Report 📝";
    if (activeTab === "ALL") tabName = isRtl ? "تقرير فحص الأجهزة العام 📋" : "General Devices Inspection Report 📋";

    let text = `*📋 ${tabName}*\n`;
    text += `${isRtl ? "التاريخ:" : "Date:"} ${printDate}\n`;
    text += `${isRtl ? "عدد البنود:" : "Total Items:"} ${filteredDevices.length} ${isRtl ? "جهاز" : "devices"}\n`;
    text += `=========================\n\n`;

    filteredDevices.forEach((d, index) => {
      text += `${index + 1}. *${d.brand} - ${d.model}*\n`;
      text += `   ${isRtl ? "السيريال:" : "SN:"} ${d.serialNumber}\n`;
      text += `   ${isRtl ? "التاجر:" : "Trader:"} ${d.trader?.name || (isRtl ? "غير محدد" : "Unspecified")}\n`;
      if (d.faultType) text += `   ${isRtl ? "العيب الملاحظ:" : "Defect:"} ${d.faultType}\n`;
      if (d.notes) text += `   ${isRtl ? "تقرير الصيانة:" : "Tech Notes:"} ${d.notes}\n`;
      text += `   ${isRtl ? "الحالة:" : "Status:"} ${DECISION_LABELS[d.decision] || d.decision}\n`;
      text += `-------------------------\n`;
    });

    text += `\n${isRtl ? "تم استخراج التقرير عبر نظام إدارة المرتجعات DeviceFlow." : "Statement extracted via DeviceFlow returns management system."}`;
    return encodeURIComponent(text);
  };

  const handleExportExcel = () => {
    const headers = isRtl ? [
      "الاسم والبراند",
      "الموديل",
      "رقم السيريال (SN)",
      "التاجر",
      "المندوب",
      "تاريخ الاستلام",
      "تاريخ التعديل",
      "مطابقة الفرز",
      "الملحقات",
      "القرار النهائي",
      "اسم الفني"
    ] : [
      "Brand",
      "Model",
      "Serial Number (SN)",
      "Trader",
      "Representative",
      "Receipt Date",
      "Inspection Date",
      "Sorting Verdict",
      "Accessories",
      "Final Decision",
      "Technician"
    ];
    const rows = filteredDevices.map(device => [
      device.brand,
      device.model,
      device.serialNumber,
      device.trader?.name || (isRtl ? "غير محدد" : "Unspecified"),
      device.batch?.representative || (isRtl ? "غير محدد" : "Unspecified"),
      device.batch?.date ? new Date(device.batch.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "—",
      device.updatedAt ? new Date(device.updatedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US") : "—",
      device.inspectionResult === "MATCH" ? (isRtl ? "مطابق" : "Matching") : device.inspectionResult === "NOT_MATCH" ? (isRtl ? "غير مطابق" : "Non-matching") : (isRtl ? "قيد الفحص" : "Under Inspection"),
      device.accessoriesStatus || "—",
      DECISION_LABELS[device.decision] || device.decision,
      device.inspectorName || "—"
    ]);

    // Create CSV content with UTF-8 BOM for Arabic in Excel
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", isRtl ? `تقرير_فرز_الأجهزة_${activeTab}_${new Date().toLocaleDateString('ar-SA')}.csv` : `devices_sorting_report_${activeTab}_${new Date().toLocaleDateString('en-US')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActiveTabTitle = () => {
    if (activeTab === "IN_WORKSHOP") return isRtl ? "تقرير الأجهزة المحولة لدى الورشة" : "Report of Devices Transferred to Workshop";
    if (activeTab === "NON_COMPLIANT_NOT_RECEIVED") return isRtl ? "تقرير الأجهزة غير المطابقة والمرفوضة" : "Report of Non-Compliant & Rejected Devices";
    if (activeTab === "READY_FOR_DELIVERY") return isRtl ? "تقرير الأجهزة الجاهزة للتسليم والصرف" : "Report of Devices Ready for Delivery";
    if (activeTab === "RETURNED_COMPLIANT") return isRtl ? "تقرير الأجهزة المرتجعة المطابقة المقبولة" : "Report of Returned Compliant Accepted Devices";
    if (activeTab === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE") return isRtl ? "تقرير الأجهزة غير المطابقة المستلمة بتعميد إداري" : "Report of Non-Compliant Devices Received with Administrative Override";
    return isRtl ? "التقرير العام للأجهزة والأذونات" : "General Report of Devices & Receipts";
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Print Hidden */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-slate-800 print:hidden animate-fade-in">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">تحديث مباشر</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300 text-sm">تقارير الفحص والفرز</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">تقارير حالات الأجهزة المستلمة</h1>
          <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
            استعرض واطبع التقارير المخصصة لكل حالة فحص فنية، بما في ذلك الأجهزة التي بالورشة، غير المطابقة، أو الجاهزة للتسليم والتسوية.
          </p>
        </div>

        {/* Action Button: Auto Generate Mock Data */}
        <button
          onClick={handleGenerateDemo}
          disabled={generating}
          className="relative inline-flex items-center gap-2 bg-gradient-to-l from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 group border border-indigo-400/30 overflow-hidden"
        >
          <div className="absolute inset-0 w-3 bg-white/20 transition-all duration-300 group-hover:w-full -skew-x-12 opacity-0 group-hover:opacity-100"></div>
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري توليد البيانات...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>توليد أجهزة تجريبية للمعاينة فورا 🧪</span>
            </>
          )}
        </button>
      </div>

      {/* Statistics counters - Print Hidden */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 print:hidden animate-fade-in">
        {/* Workshop card */}
        <button
          onClick={() => setActiveTab("IN_WORKSHOP")}
          className={`flex items-center justify-between p-5 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
            activeTab === "IN_WORKSHOP"
              ? "bg-blue-50 border-blue-300 shadow-md shadow-blue-500/5 ring-2 ring-blue-500/10"
              : "bg-white border-gray-100 shadow-sm hover:border-blue-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-bold block">🔧 لدى الورشة</span>
            <span className="text-2xl font-extrabold text-blue-700">{workshopCount}</span>
            <span className="text-[10px] text-slate-400 block">صيانة فنية معلقة</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Wrench className="h-6 w-6" />
          </div>
        </button>

        {/* Non-compliant card */}
        <button
          onClick={() => setActiveTab("NON_COMPLIANT_NOT_RECEIVED")}
          className={`flex items-center justify-between p-5 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
            activeTab === "NON_COMPLIANT_NOT_RECEIVED"
              ? "bg-orange-50 border-orange-300 shadow-md shadow-orange-500/5 ring-2 ring-orange-500/10"
              : "bg-white border-gray-100 shadow-sm hover:border-orange-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-bold block">⚠️ غير مطابق مرفوض</span>
            <span className="text-2xl font-extrabold text-orange-700">{rejectedCount}</span>
            <span className="text-[10px] text-slate-400 block">مستبعد لم يستلم</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </button>

        {/* Ready for delivery card */}
        <button
          onClick={() => setActiveTab("READY_FOR_DELIVERY")}
          className={`flex items-center justify-between p-5 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
            activeTab === "READY_FOR_DELIVERY"
              ? "bg-indigo-50 border-indigo-300 shadow-md shadow-indigo-500/5 ring-2 ring-indigo-500/10"
              : "bg-white border-gray-100 shadow-sm hover:border-indigo-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-bold block">📦 جاهز للتسليم</span>
            <span className="text-2xl font-extrabold text-indigo-700">{readyCount}</span>
            <span className="text-[10px] text-slate-400 block">جاهز للمندوب / التاجر</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckCircle className="h-6 w-6" />
          </div>
        </button>

        {/* Returned Compliant card */}
        <button
          onClick={() => setActiveTab("RETURNED_COMPLIANT")}
          className={`flex items-center justify-between p-5 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
            activeTab === "RETURNED_COMPLIANT"
              ? "bg-purple-50 border-purple-300 shadow-md shadow-purple-500/5 ring-2 ring-purple-500/10"
              : "bg-white border-gray-100 shadow-sm hover:border-purple-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-bold block">🔄 مرتجع مطابق</span>
            <span className="text-2xl font-extrabold text-purple-700">{returnedCompliantCount}</span>
            <span className="text-[10px] text-slate-400 block">سليم مقبول للمستودع</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <RotateCcw className="h-6 w-6" />
          </div>
        </button>

        {/* Non-compliant compliant with override card */}
        <button
          onClick={() => setActiveTab("NON_COMPLIANT_RECEIVED_WITH_OVERRIDE")}
          className={`flex items-center justify-between p-5 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
            activeTab === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE"
              ? "bg-amber-50 border-amber-300 shadow-md shadow-amber-500/5 ring-2 ring-amber-500/10"
              : "bg-white border-gray-100 shadow-sm hover:border-amber-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-bold block">📝 غير مطابق معمد</span>
            <span className="text-2xl font-extrabold text-amber-700">{compliantOverrideCount}</span>
            <span className="text-[10px] text-slate-400 block">مقبول بتعميد إداري</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <FileCheck className="h-6 w-6" />
          </div>
        </button>

        {/* All/Search card */}
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center justify-between p-5 rounded-xl border text-right transition-all hover:-translate-y-0.5 ${
            activeTab === "ALL"
              ? "bg-slate-50 border-slate-300 shadow-md shadow-slate-500/5 ring-2 ring-slate-500/10"
              : "bg-white border-gray-100 shadow-sm hover:border-slate-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-bold block">🔍 الكل / بحث وفلترة</span>
            <span className="text-2xl font-extrabold text-slate-700">{totalCount}</span>
            <span className="text-[10px] text-slate-400 block">إجمالي أجهزة الفحص</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="h-6 w-6" />
          </div>
        </button>
      </div>

      {/* Main filter & table board */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden animate-fade-in">
        {/* Search & Actions Bar */}
        <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث برقم السيريال، البراند، الموديل، التاجر، أو الفني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Quick Filters for All Decisions Tab */}
          {activeTab === "ALL" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold whitespace-nowrap">حالة القرار:</span>
              <select
                value={selectedDecisionFilter}
                onChange={(e) => setSelectedDecisionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="ALL">جميع القرارات</option>
                {Object.entries(DECISION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Report Actions */}
          <div className="flex items-center gap-2">
            {/* Print Current Tab */}
            <button
              onClick={() => window.print()}
              disabled={filteredDevices.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="طباعة التقرير الفني المفتوح حالياً"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة التقرير</span>
            </button>

            {/* Excel Export */}
            <button
              onClick={handleExportExcel}
              disabled={filteredDevices.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="تصدير هذا التقرير كملف إكسيل Excel"
            >
              <Download className="h-4 w-4" />
              <span>تصدير إكسيل</span>
            </button>

            {/* Whatsapp share */}
            <a
              href={filteredDevices.length > 0 ? `https://wa.me/?text=${getShareText()}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => filteredDevices.length === 0 && e.preventDefault()}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm ${
                filteredDevices.length === 0 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
              }`}
              title="مشاركة تفاصيل هذا التقرير عبر تطبيق الواتساب"
            >
              <Share2 className="h-4 w-4" />
              <span>مشاركة واتساب</span>
            </a>

            {/* SMS share */}
            <a
              href={filteredDevices.length > 0 ? `sms:?body=${getShareText()}` : "#"}
              onClick={(e) => filteredDevices.length === 0 && e.preventDefault()}
              className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm ${
                filteredDevices.length === 0 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
              }`}
              title="إرسال التقرير كرسالة نصية قصيرة للجوال"
            >
              <Share2 className="h-4 w-4" />
              <span>مشاركة SMS</span>
            </a>
          </div>
        </div>

        {/* Devices table list */}
        {filteredDevices.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">لا توجد أجهزة مطابقة للفرز</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? "جرّب تغيير عبارة البحث للحصول على نتائج." : "لم يتم العثور على أجهزة مسجلة في هذا التبويب."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 text-center">#</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم والبراند</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الموديل</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">رقم السيريال (SN)</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاجر</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المندوب</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ الاستلام</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ التعديل</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">مطابقة الفرز</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الملحقات</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">القرار النهائي</th>
                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">اسم الفني</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredDevices.map((device, index) => (
                  <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Index */}
                    <td className="px-4 py-4 text-center font-bold text-gray-400 text-sm">{index + 1}</td>

                    {/* Brand */}
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-955 text-xs">
                      {device.brand}
                    </td>

                    {/* Model */}
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-gray-700">
                      {device.model}
                    </td>

                    {/* Serial */}
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-xs font-bold text-indigo-700">
                      {device.serialNumber}
                    </td>

                    {/* Trader */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold text-gray-800">
                      {device.trader?.name || "—"}
                    </td>

                    {/* Representative */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                      {device.batch?.representative || "—"}
                    </td>

                    {/* Receipt Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                      {device.batch?.date ? new Date(device.batch.date).toLocaleDateString("ar-SA") : "—"}
                    </td>

                    {/* Inspection/Last Updated Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                      {device.updatedAt ? new Date(device.updatedAt).toLocaleDateString("ar-SA") : "—"}
                    </td>

                    {/* Inspection Result (مطابقة الفرز) */}
                    <td className="px-4 py-4 whitespace-nowrap text-center text-xs font-bold">
                      {device.inspectionResult === "MATCH" ? (
                        <span className="text-green-600">✅ مطابق</span>
                      ) : device.inspectionResult === "NOT_MATCH" ? (
                        <span className="text-red-600">❌ غير مطابق</span>
                      ) : (
                        <span className="text-gray-400">⏳ قيد الفحص</span>
                      )}
                    </td>

                    {/* Accessories */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                      {device.accessoriesStatus || "—"}
                    </td>

                    {/* Decision Badge */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold ${DECISION_COLORS[device.decision] || "bg-gray-100 text-gray-700"}`}>
                        {DECISION_LABELS[device.decision] || device.decision}
                      </span>
                    </td>

                    {/* Inspector */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-800 font-bold">
                      {device.inspectorName || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 📋 PRINT TEMPLATE - Renders only during window.print() */}
      {/* ---------------------------------------------------- */}
      <div className="hidden print:block text-black font-sans text-right p-6" dir="rtl">
        {/* Report Header */}
        <div className="text-center space-y-3 border-b-4 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">مؤسسة عاصمة المجد الفنية لإدارة الأجهزة</h1>
          <h2 className="text-xl font-bold text-gray-700 underline">{getActiveTabTitle()}</h2>
          <div className="flex justify-between items-center text-xs mt-3 px-4 font-bold text-gray-600">
            <span>تاريخ استخراج البيان: {new Date().toLocaleString("ar-SA")}</span>
            <span>عدد الأجهزة بالبيان: {filteredDevices.length} جهاز</span>
          </div>
        </div>

        {/* Descriptive details of the report status */}
        <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl mb-6 text-xs space-y-2 leading-relaxed">
          {activeTab === "IN_WORKSHOP" && (
            <p>
              **بيان الصيانة والورشة:** يحتوي هذا التقرير على الأجهزة المستلمة من المناديب والتي تم تحويلها للورشة الفنية بسبب عيوب فنية أو أعطال تمنع الاستلام المطابق. تخضع هذه الأجهزة لعمليات الفحص الدقيق والطلب الفني وقطع الغيار.
            </p>
          )}
          {activeTab === "NON_COMPLIANT_NOT_RECEIVED" && (
            <p>
              **بيان المرفوضات والمستبعدات:** يوضح هذا التقرير الأجهزة التي تم رفض استلامها نهائياً لعدم مطابقتها للمواصفات أو لوجود كسور بليغة تمنع معالجتها. يرجى تسوية هذه الأجهزة مع المناديب والتاجر فوراً وإخراجها من عهدة المستودع.
            </p>
          )}
          {activeTab === "READY_FOR_DELIVERY" && (
            <p>
              **بيان الأجهزة الجاهزة للتسليم:** يسجل هذا التقرير الأجهزة التي اكتملت صيانتها واجتازت فحص التشغيل والجودة بالورشة بنجاح، وهي جاهزة للصرف والتسليم الفوري للمندوب المعتمد أو التاجر.
            </p>
          )}
          {activeTab === "ALL" && (
            <p>
              **تقرير الفرز العام لقرارات الأجهزة:** تقرير كلي يضم سجل عمليات فحص الأجهزة الموزعة حسب الفلاتر النشطة لمتابعة الإنتاجية الفنية واللوجستية.
            </p>
          )}
        </div>

        {/* Table of items for Print */}
        <table className="min-w-full border-collapse border border-black text-[9px] text-right mb-12">
          <thead>
            <tr className="bg-gray-150 border-b-2 border-black font-bold text-center">
              <th className="border border-black px-1.5 py-1.5 w-6 text-center">#</th>
              <th className="border border-black px-2 py-1.5 text-right">الاسم والبراند</th>
              <th className="border border-black px-2 py-1.5 text-right">الموديل</th>
              <th className="border border-black px-2 py-1.5">رقم السيريال (SN)</th>
              <th className="border border-black px-2 py-1.5 text-right">التاجر</th>
              <th className="border border-black px-2 py-1.5 text-right">المندوب</th>
              <th className="border border-black px-2 py-1.5">تاريخ الاستلام</th>
              <th className="border border-black px-2 py-1.5">تاريخ التعديل</th>
              <th className="border border-black px-2 py-1.5 text-center">مطابقة الفرز</th>
              <th className="border border-black px-2 py-1.5 text-right">الملحقات</th>
              <th className="border border-black px-2 py-1.5 text-center">القرار النهائي</th>
              <th className="border border-black px-2 py-1.5 text-right">اسم الفني</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, index) => (
              <tr key={device.id} className="border-b border-black">
                <td className="border border-black px-1.5 py-1.5 text-center">{index + 1}</td>
                <td className="border border-black px-2 py-1.5 font-bold">{device.brand}</td>
                <td className="border border-black px-2 py-1.5 font-mono">{device.model}</td>
                <td className="border border-black px-2 py-1.5 font-mono text-center">{device.serialNumber}</td>
                <td className="border border-black px-2 py-1.5 font-bold">{device.trader?.name || "—"}</td>
                <td className="border border-black px-2 py-1.5">{device.batch?.representative || "—"}</td>
                <td className="border border-black px-2 py-1.5 text-center">{device.batch?.date ? new Date(device.batch.date).toLocaleDateString("ar-SA") : "—"}</td>
                <td className="border border-black px-2 py-1.5 text-center">{device.updatedAt ? new Date(device.updatedAt).toLocaleDateString("ar-SA") : "—"}</td>
                <td className="border border-black px-2 py-1.5 text-center font-bold">
                  {device.inspectionResult === "MATCH" ? "مطابق" : device.inspectionResult === "NOT_MATCH" ? "غير مطابق" : "قيد الفحص"}
                </td>
                <td className="border border-black px-2 py-1.5">{device.accessoriesStatus || "—"}</td>
                <td className="border border-black px-2 py-1.5 font-bold text-center">
                  {DECISION_LABELS[device.decision] || device.decision}
                </td>
                <td className="border border-black px-2 py-1.5">{device.inspectorName || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures section custom tailored to active report status */}
        <div className="grid grid-cols-3 gap-6 text-center mt-12 pt-8 border-t border-dashed border-gray-400 text-xs">
          {activeTab === "IN_WORKSHOP" && (
            <>
              <div className="space-y-4">
                <p className="font-bold">توقيع الفاحص المسؤول</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع مهندس الورشة</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">اعتماد مدير المستودع</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
            </>
          )}

          {activeTab === "NON_COMPLIANT_NOT_RECEIVED" && (
            <>
              <div className="space-y-4">
                <p className="font-bold">توقيع مندوب التاجر</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع أمين المستودع</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">اعتماد الإدارة الفنية</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
            </>
          )}

          {activeTab === "READY_FOR_DELIVERY" && (
            <>
              <div className="space-y-4">
                <p className="font-bold">توقيع فني الصيانة المسلّم</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع المندوب المستلم</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">اعتماد مشرف الفرز والتسليم</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
            </>
          )}

          {activeTab === "RETURNED_COMPLIANT" && (
            <>
              <div className="space-y-4">
                <p className="font-bold">توقيع الفني المسؤول</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع أمين المستودع المستلم</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">اعتماد مراقبة الجودة والمخزون</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
            </>
          )}

          {activeTab === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE" && (
            <>
              <div className="space-y-4">
                <p className="font-bold">توقيع الفاحص المسؤول</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع معمد الاستلام الإداري</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع أمين مستودع المخفض</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
            </>
          )}

          {activeTab === "ALL" && (
            <>
              <div className="space-y-4">
                <p className="font-bold">توقيع مدخل البيانات</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">توقيع رئيس قسم الفحص</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold">اعتماد المدير التنفيذي</p>
                <div className="h-10"></div>
                <p className="text-gray-400">________________________</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
