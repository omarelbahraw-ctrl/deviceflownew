"use client";

import { useState } from "react";
import {
  FileText,
  Printer,
  Share2,
  Calendar,
  User,
  Users,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  Layers,
  ChevronLeft,
  Download,
} from "lucide-react";
import Link from "next/link";

interface TraderReportClientProps {
  initialTraders: any[];
  initialDevices: any[];
}

const DECISION_LABELS: Record<string, string> = {
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
};

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

export default function TraderReportClient({
  initialTraders,
  initialDevices,
}: TraderReportClientProps) {
  const [selectedTraderId, setSelectedTraderId] = useState(
    initialTraders[0]?.id || ""
  );
  
  // Date states - defaulting to current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTrader = initialTraders.find((t) => t.id === selectedTraderId);

  // Filter devices: matching trader, month, and year
  const filteredDevices = initialDevices.filter((device) => {
    if (device.traderId !== selectedTraderId) return false;
    if (!device.batch?.date) return false;
    
    const devDate = new Date(device.batch.date);
    const matchesMonth = devDate.getMonth() + 1 === selectedMonth;
    const matchesYear = devDate.getFullYear() === selectedYear;
    
    if (!matchesMonth || !matchesYear) return false;

    // Search query match
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      return (
        device.serialNumber?.toLowerCase().includes(term) ||
        device.brand?.toLowerCase().includes(term) ||
        device.model?.toLowerCase().includes(term) ||
        device.batch?.representative?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Calculate statistics for the selected monthly trader devices
  const totalCount = filteredDevices.length;
  const acceptedCount = filteredDevices.filter(
    (d) => d.decision === "ACCEPT" || d.decision === "RETURNED_COMPLIANT"
  ).length;
  const overrideCount = filteredDevices.filter(
    (d) => d.decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE"
  ).length;
  const workshopCount = filteredDevices.filter(
    (d) => d.decision === "IN_WORKSHOP" || d.decision === "READY_FOR_DELIVERY"
  ).length;
  const rejectedCount = filteredDevices.filter(
    (d) =>
      d.decision === "NON_COMPLIANT_NOT_RECEIVED" ||
      d.decision === "REJECTED_AND_DELIVERY_REJECTED" ||
      d.decision === "REPAIRED_BUT_REJECTED"
  ).length;
  const pendingCount = filteredDevices.filter((d) => d.decision === "PENDING").length;

  // Rep representative distribution
  const representativeStats: Record<string, number> = {};
  filteredDevices.forEach((device) => {
    const repName = device.batch?.representative || "غير محدد";
    representativeStats[repName] = (representativeStats[repName] || 0) + 1;
  });

  const repsList = Object.entries(representativeStats).map(([name, count]) => ({
    name,
    count,
  }));

  const months = [
    { value: 1, label: "يناير (01)" },
    { value: 2, label: "فبراير (02)" },
    { value: 3, label: "مارس (03)" },
    { value: 4, label: "أبريل (04)" },
    { value: 5, label: "مايو (05)" },
    { value: 6, label: "يونيو (06)" },
    { value: 7, label: "يوليو (07)" },
    { value: 8, label: "أغسطس (08)" },
    { value: 9, label: "سبتمبر (09)" },
    { value: 10, label: "أكتوبر (10)" },
    { value: 11, label: "نوفمبر (11)" },
    { value: 12, label: "ديسمبر (12)" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - 2 + i
  );

  // Formatting WhatsApp & SMS share text
  const getShareText = () => {
    if (!selectedTrader) return "";
    
    let text = `*📋 تقرير الحساب الشهري للتاجر: ${selectedTrader.name}*\n`;
    text += `الشهر: ${selectedMonth} / ${selectedYear}\n`;
    text += `إجمالي الأجهزة المستلمة: ${totalCount} جهاز\n`;
    text += `----------------------------------------\n`;
    text += `✅ مطابق ومقبول: ${acceptedCount}\n`;
    text += `📝 غير مطابق معمد (المعمد): ${overrideCount}\n`;
    text += `🔧 في الورشة والصيانة: ${workshopCount}\n`;
    text += `❌ مرفوض ومستبعد: ${rejectedCount}\n`;
    text += `⏳ قيد المعاينة والانتظار: ${pendingCount}\n`;
    text += `=========================\n\n`;

    if (repsList.length > 0) {
      text += `*🚚 إحصائية تسليم المناديب:*\n`;
      repsList.forEach((rep) => {
        text += `- المندوب: ${rep.name} (${rep.count} جهاز)\n`;
      });
      text += `----------------------------------------\n\n`;
    }

    text += `*📱 تفاصيل أجهزة الفحص:*\n`;
    filteredDevices.slice(0, 10).forEach((d, i) => {
      text += `${i + 1}. [${d.brand} - ${d.model}] سيريال: ${d.serialNumber} -> ${DECISION_LABELS[d.decision] || d.decision}\n`;
    });

    if (totalCount > 10) {
      text += `... والمزيد (${totalCount - 10} أجهزة أخرى)\n`;
    }

    text += `\nتم استخراجه عبر نظام المرتجعات DeviceFlow.`;
    return encodeURIComponent(text);
  };

  const handleExportExcel = () => {
    if (!selectedTrader) return;
    const headers = ["الرقم التسلسلي للجهاز (SN)", "البراند", "الموديل", "المندوب المسلّم", "التشخيص والعيب", "القرار النهائي للفرز"];
    const rows = filteredDevices.map(device => [
      device.serialNumber,
      device.brand,
      device.model,
      device.batch?.representative || "غير محدد",
      device.faultType || "سليم",
      DECISION_LABELS[device.decision] || device.decision
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
    link.setAttribute("download", `تقرير_حساب_شهري_${selectedTrader.name}_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header - Print Hidden */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            تقارير التجار وحسابات المناديب الشهرية
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ابحث وتتبع إجمالي الأجهزة ومحاسبة المناديب حسب التاجر والشهر
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <Link
            href="/reports"
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> تقارير الفرز العامة
          </Link>
        </div>
      </div>

      {/* Control Panel - Filter & Selectors - Print Hidden */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 print:hidden space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Select Trader */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-gray-400" /> اختيار التاجر/العميل:
            </label>
            <select
              value={selectedTraderId}
              onChange={(e) => setSelectedTraderId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
            >
              {initialTraders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Month */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" /> الشهر:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Year */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" /> السنة:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Search query */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
              <Search className="h-3.5 w-3.5 text-gray-400" /> بحث سريع بالبيانات:
            </label>
            <input
              type="text"
              placeholder="ابحث بالسيريال، الموديل، المندوب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Report Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={() => window.print()}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> طباعة كشف الحساب الشهري
          </button>

          <button
            onClick={handleExportExcel}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> تصدير إكسيل
          </button>

          <a
            href={totalCount > 0 ? `https://wa.me/?text=${getShareText()}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => totalCount === 0 && e.preventDefault()}
            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm ${
              totalCount === 0 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Share2 className="h-4 w-4" /> مشاركة الكشف (واتساب)
          </a>

          <a
            href={totalCount > 0 ? `sms:?body=${getShareText()}` : "#"}
            onClick={(e) => totalCount === 0 && e.preventDefault()}
            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm ${
              totalCount === 0 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <Share2 className="h-4 w-4" /> مشاركة الكشف (SMS)
          </a>
        </div>
      </div>

      {/* statistics cards - Print Hidden */}
      {selectedTrader && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-bold block mb-1">📦 إجمالي الأجهزة</span>
            <span className="text-3xl font-extrabold text-slate-850">{totalCount}</span>
            <span className="text-[10px] text-gray-400 block mt-1">المستلمة هذا الشهر</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-bold block mb-1">✅ مطابق ومقبول</span>
            <span className="text-3xl font-extrabold text-green-600">{acceptedCount}</span>
            <span className="text-[10px] text-gray-400 block mt-1">دخلت المخزون فوراً</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-bold block mb-1">📝 غير مطابق معمد (المعمد)</span>
            <span className="text-3xl font-extrabold text-amber-600">{overrideCount}</span>
            <span className="text-[10px] text-gray-400 block mt-1">مقبول بتعميد إداري</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-bold block mb-1">🔧 لدى الصيانة والورشة</span>
            <span className="text-3xl font-extrabold text-blue-650">{workshopCount}</span>
            <span className="text-[10px] text-gray-400 block mt-1">تحت الإصلاح / جاهز</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <span className="text-xs text-gray-500 font-bold block mb-1">❌ مرفوض ومستبعد</span>
            <span className="text-3xl font-extrabold text-red-600">{rejectedCount}</span>
            <span className="text-[10px] text-gray-400 block mt-1">مرتجع للعميل مع المندوب</span>
          </div>
        </div>
      )}

      {/* Main Details and representatives count */}
      {totalCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          {/* Representative Breakdown Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
            <h3 className="text-md font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              إحصائية المناديب المسلمين ({repsList.length} مندوب)
            </h3>
            <p className="text-xs text-gray-500">
              عدد الأجهزة التي جلبها كل مندوب تابع للمؤسسة في هذا الشهر للتسوية والفرز.
            </p>
            <div className="divide-y divide-gray-100">
              {repsList.map((rep) => (
                <div
                  key={rep.name}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-650">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-gray-800">{rep.name}</span>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold text-xs">
                    {rep.count} جهاز
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly inspecetd devices details */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-md">
                <Layers className="h-5 w-5 text-gray-400" />
                سجل أجهزة التاجر المفصلة ({totalCount} جهاز)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-right divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-500 w-10 text-center">#</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-500">الجهاز والموديل</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-500">السيريال</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-500">المندوب</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-500">القرار النهائي</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-500">العيب والتشخيص</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredDevices.map((device, index) => (
                    <tr key={device.id} className="hover:bg-slate-50/50 text-sm">
                      <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{device.brand}</span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5">{device.model}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-indigo-700">
                        {device.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-semibold">
                        {device.batch?.representative || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-bold ${DECISION_COLORS[device.decision] || "bg-gray-100"}`}>
                          {DECISION_LABELS[device.decision] || device.decision}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={device.notes || ""}>
                        <span className="block text-gray-800 font-medium">{device.faultType || "سليم"}</span>
                        {device.notes && <span className="block text-gray-400 truncate mt-0.5">{device.notes}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center print:hidden">
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">لا توجد أجهزة مسجلة</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {selectedTrader
              ? `لم يتم العثور على أية أجهزة مستلمة للتاجر "${selectedTrader.name}" خلال شهر ${selectedMonth} / ${selectedYear}.`
              : "يرجى اختيار تاجر للبدء في استعراض التقارير الشهرية."}
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 📋 PRINT TEMPLATE - Renders only during window.print() */}
      {/* ---------------------------------------------------- */}
      {selectedTrader && (
        <div className="hidden print:block text-black font-sans text-right p-4" dir="rtl">
          {/* Statement Header */}
          <div className="text-center space-y-3 border-b-4 border-black pb-4 mb-6">
            <h1 className="text-3xl font-extrabold">مؤسسة عاصمة المجد الفنية لإدارة الأجهزة</h1>
            <h2 className="text-lg font-bold text-gray-700 underline">كشف الحساب الشهري التفصيلي للتاجر</h2>
            <p className="text-xs text-gray-500">تم الاستخراج بتاريخ: {new Date().toLocaleString("ar-SA")}</p>
          </div>

          {/* Statement Info Box */}
          <div className="grid grid-cols-2 gap-4 border border-black p-4 rounded-xl mb-6 text-xs">
            <div>
              <span className="font-bold block text-gray-700">العميل / التاجر:</span>
              <span className="text-sm font-bold">{selectedTrader.name}</span>
            </div>
            <div>
              <span className="font-bold block text-gray-700">فترة الحساب الشهرية:</span>
              <span className="text-sm font-bold">شهر {selectedMonth} / سنة {selectedYear}</span>
            </div>
            <div>
              <span className="font-bold block text-gray-700">هاتف العميل:</span>
              <span>{selectedTrader.phone || "—"}</span>
            </div>
            <div>
              <span className="font-bold block text-gray-700">إجمالي الأجهزة المستلمة:</span>
              <span className="text-sm font-bold">{totalCount} جهاز</span>
            </div>
          </div>

          {/* Statistics summary for Trader Printout */}
          <h3 className="text-xs font-bold mb-2 border-r-4 border-black pr-2">ملخص فرز وتقييم الأجهزة الشهري:</h3>
          <div className="grid grid-cols-5 gap-2 border border-black p-3 rounded-lg text-[10px] text-center mb-6">
            <div>
              <span className="font-bold block">إجمالي المستلم</span>
              <span className="text-sm font-bold">{totalCount}</span>
            </div>
            <div>
              <span className="font-bold block text-green-700">✅ مطابق ومقبول</span>
              <span className="text-sm font-bold">{acceptedCount}</span>
            </div>
            <div>
              <span className="font-bold block text-amber-700">📝 غير مطابق معمد</span>
              <span className="text-sm font-bold">{overrideCount}</span>
            </div>
            <div>
              <span className="font-bold block text-blue-700">🔧 ورشة وصيانة</span>
              <span className="text-sm font-bold">{workshopCount}</span>
            </div>
            <div>
              <span className="font-bold block text-red-750">❌ مرفوض ومستبعد</span>
              <span className="text-sm font-bold">{rejectedCount}</span>
            </div>
          </div>

          {/* Table of items for Print */}
          <h3 className="text-xs font-bold mb-3 border-r-4 border-black pr-2">الأصناف والأجهزة المفصلة:</h3>
          <table className="min-w-full border-collapse border border-black text-[10px] text-right mb-12">
            <thead>
              <tr className="bg-gray-150 border-b-2 border-black font-bold">
                <th className="border border-black px-2 py-1.5 w-8 text-center">#</th>
                <th className="border border-black px-2.5 py-1.5">البراند والموديل</th>
                <th className="border border-black px-2.5 py-1.5">رقم السيريال</th>
                <th className="border border-black px-2.5 py-1.5">المندوب المسلّم</th>
                <th className="border border-black px-2.5 py-1.5">التشخيص والعيب</th>
                <th className="border border-black px-2.5 py-1.5">القرار النهائي للفرز</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device, index) => (
                <tr key={device.id} className="border-b border-black">
                  <td className="border border-black px-2 py-1.5 text-center">{index + 1}</td>
                  <td className="border border-black px-2.5 py-1.5 font-bold">{device.brand} - {device.model}</td>
                  <td className="border border-black px-2.5 py-1.5 font-mono">{device.serialNumber}</td>
                  <td className="border border-black px-2.5 py-1.5">{device.batch?.representative || "غير محدد"}</td>
                  <td className="border border-black px-2.5 py-1.5">{device.faultType || "سليم"} {device.notes ? `- ${device.notes}` : ""}</td>
                  <td className="border border-black px-2.5 py-1.5 font-bold">
                    {DECISION_LABELS[device.decision] || device.decision}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures section for Monthly audit statement */}
          <div className="grid grid-cols-3 gap-8 text-center mt-16 pt-8 border-t border-dashed border-gray-400 text-xs">
            <div className="space-y-4">
              <p className="font-bold">توقيع وتفويض التاجر/العميل</p>
              <div className="h-8"></div>
              <p className="text-gray-400">________________________</p>
              <p className="text-[10px]">الاسم: .......................................</p>
            </div>
            <div className="space-y-4">
              <p className="font-bold">توقيع ومطابقة أمين المستودع</p>
              <div className="h-8"></div>
              <p className="text-gray-400">________________________</p>
              <p className="text-[10px]">الاسم: .......................................</p>
            </div>
            <div className="space-y-4">
              <p className="font-bold">اعتماد إدارة الحسابات المالية</p>
              <div className="h-8"></div>
              <p className="text-gray-400">________________________</p>
              <p className="text-[10px]">الاسم: .......................................</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
