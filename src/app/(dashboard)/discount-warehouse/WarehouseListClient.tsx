"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, Trash2, Tags, CheckCircle, XCircle, Printer, Download } from "lucide-react";
import { deleteDiscountItem, toggleSoldStatus } from "./actions";

type ItemData = {
  id: string;
  brand: string;
  model: string;
  type: string;
  serialNumber: string;
  category: string;
  workingStatus: string;
  previousIssue: string | null;
  readyForSale: boolean;
  priceAfter: number | null;
  image1: string | null;
};

const GRADE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  B: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  C: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

export default function WarehouseListClient({ items }: { items: ItemData[] }) {
  const [filter, setFilter] = useState<"ALL" | "A" | "B" | "C">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = items.filter((item) => {
    if (filter !== "ALL" && item.category !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الجهاز من المستودع؟")) return;
    await deleteDiscountItem(id);
    window.location.reload();
  };

  const handleToggleSold = async (id: string, currentReady: boolean) => {
    const res = await toggleSoldStatus(id, currentReady);
    if (res.success) {
      window.location.reload();
    } else {
      alert("حدث خطأ أثناء تحديث حالة البيع");
    }
  };

  const handleExportExcel = () => {
    const headers = ["الرقم التسلسلي", "البراند", "الموديل", "نوع الجهاز", "السيريال", "الفئة", "الحالة الفنية", "المشكلة السابقة", "حالة البيع", "السعر المخفض (ر.س)"];
    const rows = filtered.map(item => [
      item.id,
      item.brand,
      item.model,
      item.type,
      item.serialNumber,
      item.category,
      item.workingStatus,
      item.previousIssue || "لا يوجد",
      item.readyForSale ? "متاح للبيع" : "تم البيع",
      item.priceAfter ? item.priceAfter.toString() : "غير محدد"
    ]);

    // Create CSV content with UTF-8 BOM for Arabic in Excel
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(val => `"${val.replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `مخزون_المستودع_المخفض_${new Date().toLocaleDateString('ar-SA')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col lg:flex-row gap-3 print:hidden">
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "A", "B", "C"] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setFilter(grade)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === grade
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {grade === "ALL" ? "الكل" : `فئة ${grade}`}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 pr-11 pl-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="ابحث بالبراند أو الموديل أو السيريال..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            disabled={filtered.length === 0}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            title="طباعة كشف مخزون المستودع المخفض"
          >
            <Printer className="h-4 w-4" /> طباعة المخزون
          </button>
          <button
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            title="تصدير بيانات المخزون كملف إكسيل Excel"
          >
            <Download className="h-4 w-4" /> تصدير إكسيل
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-sm print:hidden">
          <Tags className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            {searchQuery ? "لا توجد نتائج" : "المستودع فارغ"}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? "جرّب كلمة بحث مختلفة" : "أضف أول جهاز للمستودع المخفّض"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 text-center">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الجهاز والموديل</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">رقم السيريال</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الفئة</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة الفنية</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التشخيص والمشكلة</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">السعر المخفض</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الحالة</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((item, index) => {
                  const grade = GRADE_STYLES[item.category] || GRADE_STYLES.C;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${!item.readyForSale ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{item.brand} {item.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">{item.type || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-indigo-700">{item.serialNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full ${grade.bg} ${grade.text} font-bold text-xs border ${grade.border}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-700">
                        {item.workingStatus === "WORKING" ? (
                          <span className="text-green-600">✅ يعمل بالكامل</span>
                        ) : item.workingStatus === "MINOR_ISSUE" ? (
                          <span className="text-amber-600">⚠️ عيب بسيط</span>
                        ) : (
                          <span className="text-red-600">🔧 يحتاج إصلاح</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={item.previousIssue || ""}>
                        {item.previousIssue || "لا يوجد عيب مسجل"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-green-600 text-sm">
                        {item.priceAfter ? `${item.priceAfter.toLocaleString()} ر.س` : "غير محدد"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleSold(item.id, item.readyForSale)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 mx-auto transition-colors ${
                            item.readyForSale
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-150 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {item.readyForSale ? (
                            <><CheckCircle className="h-3.5 w-3.5" /> متاح</>
                          ) : (
                            <><XCircle className="h-3.5 w-3.5" /> تم البيع</>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/discount-warehouse/${item.id}`}
                            className="px-2.5 py-1.5 text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> التفاصيل
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="حذف الجهاز"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📋 PRINT VIEW FOR DISCOUNT WAREHOUSE INVENTORY */}
      <div className="hidden print:block text-black font-sans text-right p-4 animate-fade-in" dir="rtl">
        <div className="text-center space-y-3 border-b-4 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold">مؤسسة عاصمة المجد الفنية لإدارة الأجهزة</h1>
          <h2 className="text-xl font-bold text-gray-700 underline">كشف مخزون المستودع المخفض</h2>
          <div className="flex justify-between items-center text-xs mt-3 px-4 font-bold text-gray-600">
            <span>تاريخ الطباعة: {new Date().toLocaleString("ar-SA")}</span>
            <span>الفئة النشطة: {filter === "ALL" ? "الكل" : `فئة ${filter}`}</span>
            <span>عدد الأجهزة: {filtered.length} جهاز</span>
          </div>
        </div>

        <table className="min-w-full border-collapse border border-black text-xs text-right">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black font-bold">
              <th className="border border-black px-2 py-2 w-8 text-center">#</th>
              <th className="border border-black px-3 py-2 w-48">البراند والموديل</th>
              <th className="border border-black px-3 py-2">النوع</th>
              <th className="border border-black px-3 py-2 font-mono">رقم السيريال</th>
              <th className="border border-black px-3 py-2 w-16 text-center">الفئة</th>
              <th className="border border-black px-3 py-2">التشخيص والمشكلة</th>
              <th className="border border-black px-3 py-2 w-28 text-center">السعر المخفض</th>
              <th className="border border-black px-3 py-2 w-20 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <tr key={item.id} className="border-b border-black">
                <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                <td className="border border-black px-3 py-2 font-bold">{item.brand} - {item.model}</td>
                <td className="border border-black px-3 py-2">{item.type || "—"}</td>
                <td className="border border-black px-3 py-2 font-mono">{item.serialNumber}</td>
                <td className="border border-black px-3 py-2 text-center font-bold">{item.category}</td>
                <td className="border border-black px-3 py-2 text-gray-600">{item.previousIssue || "لا يوجد"}</td>
                <td className="border border-black px-3 py-2 text-center font-bold">{item.priceAfter ? `${item.priceAfter.toLocaleString()} ر.س` : "غير محدد"}</td>
                <td className="border border-black px-3 py-2 text-center font-bold">
                  {item.readyForSale ? "متاح للبيع" : "تم البيع"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* signatures */}
        <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-dashed border-gray-400 text-center text-xs">
          <div className="space-y-4">
            <p className="font-bold">توقيع مسؤول الفرز والبيع</p>
            <div className="h-8"></div>
            <p className="text-gray-400">________________________</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold">اعتماد إدارة المستودع</p>
            <div className="h-8"></div>
            <p className="text-gray-400">________________________</p>
          </div>
        </div>
      </div>
    </>
  );
}
