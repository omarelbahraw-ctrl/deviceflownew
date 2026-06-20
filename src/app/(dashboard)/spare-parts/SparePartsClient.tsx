"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSparePart,
  updateSparePart,
  deleteSparePart,
  addPartTransaction,
} from "./actions";
import {
  Wrench,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  AlertTriangle,
  History,
  Info,
  Settings,
  FolderOpen,
  Cpu,
  Trash2,
  Edit,
  DollarSign,
  ClipboardCheck,
  Loader2,
  Printer,
  Download,
} from "lucide-react";

interface SparePartsClientProps {
  initialParts: any[];
  initialTransactions: any[];
}

export default function SparePartsClient({
  initialParts,
  initialTransactions,
}: SparePartsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"CATALOG" | "TRANSACTIONS">("CATALOG");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [txType, setTxType] = useState<"IN" | "OUT">("IN");
  
  // Transaction form states
  const [txQty, setTxQty] = useState(1);
  const [txRecipient, setTxRecipient] = useState("");
  const [txRef, setTxRef] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [txError, setTxError] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  // Statistics
  const totalParts = initialParts.length;
  const lowStockParts = initialParts.filter((p) => p.quantity <= p.minQuantity).length;
  const totalInCount = initialTransactions.filter((t) => t.type === "IN").length;
  const totalOutCount = initialTransactions.filter((t) => t.type === "OUT").length;

  // Filter parts based on query
  const filteredParts = initialParts.filter((part) => {
    const term = searchQuery.toLowerCase();
    if (!term) return true;
    return (
      part.name?.toLowerCase().includes(term) ||
      part.code?.toLowerCase().includes(term) ||
      part.compatibleModels?.toLowerCase().includes(term)
    );
  });

  // Filter transactions based on query
  const filteredTransactions = initialTransactions.filter((tx) => {
    const term = searchQuery.toLowerCase();
    if (!term) return true;
    return (
      tx.part?.name?.toLowerCase().includes(term) ||
      tx.part?.code?.toLowerCase().includes(term) ||
      tx.recipient?.toLowerCase().includes(term) ||
      tx.reference?.toLowerCase().includes(term)
    );
  });

  // Submit Part Creation
  const handleAddPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const res = await createSparePart(formData);
    if (res.success) {
      alert("تمت إضافة قطعة الغيار بنجاح للمستودع المركزي!");
      setShowAddModal(false);
      router.refresh();
    } else {
      alert(res.error || "خطأ أثناء الحفظ");
    }
  };

  // Submit Part Update
  const handleEditPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPart) return;

    const formData = new FormData(e.currentTarget);
    const res = await updateSparePart(selectedPart.id, formData);
    if (res.success) {
      alert("تم تعديل تفاصيل قطعة الغيار بنجاح!");
      setShowEditModal(false);
      setSelectedPart(null);
      router.refresh();
    } else {
      alert(res.error || "خطأ أثناء الحفظ");
    }
  };

  // Handle Part Deletion
  const handleDeletePart = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف قطعة الغيار هذه نهائياً من المستودع المركزي؟")) return;

    const res = await deleteSparePart(id);
    if (res.success) {
      alert("تم حذف قطعة الغيار من النظام بنجاح.");
      router.refresh();
    } else {
      alert(res.error || "حدث خطأ");
    }
  };

  // Submit Transaction (IN / OUT)
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;

    setTxError("");
    setTxLoading(true);

    const res = await addPartTransaction(
      selectedPart.id,
      txType,
      txQty,
      txRecipient,
      txRef,
      txNotes
    );

    setTxLoading(false);
    if (res.success) {
      alert(
        txType === "IN"
          ? "تم توريد وإدخال الكمية الجديدة للمخزون بنجاح ✅"
          : "تم صرف وخصم الكمية المطلوبة من المخزون بنجاح ✅"
      );
      setShowTxModal(false);
      setSelectedPart(null);
      // Reset form fields
      setTxQty(1);
      setTxRecipient("");
      setTxRef("");
      setTxNotes("");
      router.refresh();
    } else {
      setTxError(res.error || "خطأ غير متوقع أثناء الحركة المخزنية");
    }
  };

  // Trigger Transaction Modal
  const triggerTxModal = (part: any, type: "IN" | "OUT") => {
    setSelectedPart(part);
    setTxType(type);
    setShowTxModal(true);
  };

  const handleExportExcel = () => {
    if (activeTab === "CATALOG") {
      const headers = ["كود الصنف (SKU)", "اسم قطعة الغيار", "الموديل المتوافق", "الكمية المتوفرة", "سعر الوحدة (ر.س)"];
      const rows = filteredParts.map(part => [
        part.code,
        part.name,
        part.compatibleModels || "—",
        part.quantity,
        part.price ? part.price.toFixed(2) : "غير محدد"
      ]);

      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `جرد_قطع_الغيار_${new Date().toLocaleDateString('ar-SA')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["التاريخ والوقت", "اسم القطعة", "كود القطعة", "نوع الحركة", "الكمية", "المسؤول / المستلم", "رقم المرجع / البلاغ", "الملاحظات"];
      const rows = filteredTransactions.map(tx => [
        new Date(tx.date).toLocaleString("ar-SA"),
        tx.part?.name || "—",
        tx.part?.code || "—",
        tx.type === "IN" ? "توريد مخزني" : "صرف صيانة",
        tx.quantity,
        tx.recipient || "—",
        tx.reference || "—",
        tx.notes || "—"
      ]);

      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `سجل_حركات_قطع_الغيار_${new Date().toLocaleDateString('ar-SA')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-600 animate-pulse" />
            مستودع قطع الغيار المركزية (Spare Parts Stock)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة قطع الصيانة وإثبات عمليات التوريد والصرف لطلبات وأوامر الصيانة
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" /> إضافة قطعة غيار جديدة
        </button>
      </div>

      {/* Statistics counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block mb-1">📦 إجمالي الأصناف</span>
          <span className="text-3xl font-extrabold text-slate-800">{totalParts}</span>
          <span className="text-[10px] text-gray-400 block mt-1">صنف مسجل بالمستودع</span>
        </div>

        <div className={`rounded-2xl border p-5 shadow-sm ${
          lowStockParts > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
        }`}>
          <span className="text-xs text-gray-500 font-bold block mb-1">⚠️ منخفض المخزون</span>
          <span className={`text-3xl font-extrabold ${
            lowStockParts > 0 ? "text-red-600" : "text-slate-800"
          }`}>{lowStockParts}</span>
          <span className="text-[10px] text-gray-400 block mt-1">كميات تحت حد الطلب</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block mb-1">📥 حركات التوريد (IN)</span>
          <span className="text-3xl font-extrabold text-emerald-600">{totalInCount}</span>
          <span className="text-[10px] text-gray-400 block mt-1">حركة إدخال مخزني</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <span className="text-xs text-gray-500 font-bold block mb-1">📤 حركات الصرف (OUT)</span>
          <span className="text-3xl font-extrabold text-blue-600">{totalOutCount}</span>
          <span className="text-[10px] text-gray-400 block mt-1">حركة صرف وإصدار أجهزة</span>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockParts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-sm print:hidden">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">تنبيه انخفاض مستوى المخزون!</span>
            <span>
              هناك **{lowStockParts}** أصناف من قطع الغيار وصلت أو قلت عن الحد الأدنى المسموح به. يرجى توريد كميات جديدة لتجنب تأخير عمليات الصيانة للعملاء.
            </span>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 print:hidden">
        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "CATALOG"
              ? "border-indigo-600 text-indigo-650"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FolderOpen className="h-4.5 w-4.5 inline-block ml-1.5" />
          قائمة أصناف المخزون
        </button>
        <button
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "TRANSACTIONS"
              ? "border-indigo-600 text-indigo-650"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="h-4.5 w-4.5 inline-block ml-1.5" />
          سجل الحركات (الإدخال والصرف)
        </button>
      </div>

      {/* Filter and Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        {/* Search tool */}
        <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2 print:hidden">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === "CATALOG"
                  ? "ابحث باسم القطعة، الكود، الموديلات المتوافقة..."
                  : "ابحث بالمسؤول، رقم البلاغ، القطعة..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              title="طباعة الكشف الحالي لقطع الغيار"
            >
              <Printer className="h-4 w-4" /> طباعة الكشف الحالي
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              title="تصدير البيانات كملف إكسيل Excel"
            >
              <Download className="h-4 w-4" /> تصدير إكسيل
            </button>
          </div>
        </div>

        {/* Tab 1: Catalog view */}
        {activeTab === "CATALOG" && (
          <div className="overflow-x-auto">
            {filteredParts.length === 0 ? (
              <div className="p-16 text-center text-gray-500">لا توجد قطع غيار مسجلة بالمستودع تطابق البحث.</div>
            ) : (
              <table className="min-w-full text-right divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">كود القطعة (SKU)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">اسم قطعة الغيار</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الموديلات المتوافقة</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الكمية بالرصيد</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">سعر الوحدة</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">إجراءات المخزن</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredParts.map((part) => {
                    const isLow = part.quantity <= part.minQuantity;
                    return (
                      <tr key={part.id} className="hover:bg-slate-50/50 text-sm">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-indigo-700">
                          {part.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{part.name}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{part.compatibleModels}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center h-8 min-w-[2.5rem] px-2 rounded-lg font-bold text-xs ${
                            isLow 
                              ? "bg-red-50 text-red-700 border border-red-200 animate-pulse" 
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-mono font-bold text-gray-700">
                          {part.price ? `${part.price.toFixed(2)} ر.س` : "غير محدد"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Stock IN */}
                            <button
                              onClick={() => triggerTxModal(part, "IN")}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-250 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                              title="إدخال وتوريد كمية للمخزن"
                            >
                              <ArrowDownCircle className="h-3.5 w-3.5" /> توريد
                            </button>

                            {/* Stock OUT */}
                            <button
                              onClick={() => triggerTxModal(part, "OUT")}
                              disabled={part.quantity <= 0}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-250 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="صرف وسحب كمية صيانة"
                            >
                              <ArrowUpCircle className="h-3.5 w-3.5" /> صرف
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setSelectedPart(part);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg transition-colors border border-gray-200"
                              title="تعديل بيانات الصنف"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeletePart(part.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg transition-colors border border-gray-200"
                              title="حذف الصنف نهائياً"
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
            )}
          </div>
        )}

        {/* Tab 2: Transaction history logs */}
        {activeTab === "TRANSACTIONS" && (
          <div className="overflow-x-auto">
            {filteredTransactions.length === 0 ? (
              <div className="p-16 text-center text-gray-500">لا توجد حركات مخزنية مسجلة بالنظام تطابق البحث.</div>
            ) : (
              <table className="min-w-full text-right divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 w-36">التاريخ والوقت</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500">قطعة الغيار الكود</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 text-center w-28">نوع الحركة</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 text-center w-20">الكمية</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500">المستلم / المورد</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500">رقم البلاغ / المرجع</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500">ملاحظات الحركة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        <span className="block font-medium">{new Date(tx.date).toLocaleDateString("ar-SA")}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          {new Date(tx.date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{tx.part?.name || "صنف محذوف"}</span>
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5">{tx.part?.code || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          tx.type === "IN" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {tx.type === "IN" ? "📥 توريد وإدخال" : "📤 صرف وسحب"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">{tx.quantity}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">{tx.recipient || "—"}</td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-600">{tx.reference || "—"}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={tx.notes || ""}>
                        {tx.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 🔮 MODALS & DIALOG OVERLAYS */}
      {/* ---------------------------------------------------- */}

      {/* Modal 1: Add Spare Part */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in text-right">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Plus className="h-5 w-5 text-indigo-600" /> تسجيل صنف قطعة غيار جديد
            </h3>
            
            <form onSubmit={handleAddPart} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">اسم قطعة الغيار:</label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="مثال: شريط ليد سامسونج 55 بوصة"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">كود الصنف (SKU):</label>
                <input
                  required
                  type="text"
                  name="code"
                  placeholder="مثال: SP-SAM-55-LED"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs text-indigo-700 font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">الموديلات المتوافقة:</label>
                <input
                  required
                  type="text"
                  name="compatibleModels"
                  placeholder="مثال: SAMSUNG-QE55, UA55T7000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">الكمية المبدئية:</label>
                  <input
                    required
                    type="number"
                    name="quantity"
                    min={0}
                    defaultValue={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">حد الطلب الأدنى:</label>
                  <input
                    required
                    type="number"
                    name="minQuantity"
                    min={0}
                    defaultValue={5}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">سعر الوحدة (ر.س):</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min={0}
                    placeholder="اختياري"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-150 rounded-lg font-bold text-xs text-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Spare Part */}
      {showEditModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in text-right">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Edit className="h-5 w-5 text-indigo-600" /> تعديل صنف: {selectedPart.name}
            </h3>
            
            <form onSubmit={handleEditPart} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">اسم قطعة الغيار:</label>
                <input
                  required
                  type="text"
                  name="name"
                  defaultValue={selectedPart.name}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">كود الصنف (غير قابل للتعديل):</label>
                <input
                  disabled
                  type="text"
                  value={selectedPart.code}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-gray-500 font-mono text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">الموديلات المتوافقة:</label>
                <input
                  required
                  type="text"
                  name="compatibleModels"
                  defaultValue={selectedPart.compatibleModels}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">حد الطلب الأدنى:</label>
                  <input
                    required
                    type="number"
                    name="minQuantity"
                    min={0}
                    defaultValue={selectedPart.minQuantity}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">سعر الوحدة (ر.س):</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min={0}
                    defaultValue={selectedPart.price || ""}
                    placeholder="لا يوجد"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPart(null);
                  }}
                  className="px-4 py-2 bg-gray-150 rounded-lg font-bold text-xs text-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Transaction Modal (IN / OUT) */}
      {showTxModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-in text-right">
            <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              {txType === "IN" ? (
                <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <ArrowUpCircle className="h-5 w-5 text-blue-600" />
              )}
              {txType === "IN"
                ? `عملية توريد وإدخال: ${selectedPart.name}`
                : `عملية صرف وسحب: ${selectedPart.name}`}
            </h3>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">كود الصنف (SKU):</span>
                <span className="font-mono font-bold">{selectedPart.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">الرصيد المتوفر حالياً:</span>
                <span className="font-bold text-indigo-700">{selectedPart.quantity} وحدة</span>
              </div>
            </div>

            {txError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold">
                ⚠️ {txError}
              </div>
            )}

            <form onSubmit={handleTxSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">الكمية المطلوبة:</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={txType === "OUT" ? selectedPart.quantity : undefined}
                  value={txQty}
                  onChange={(e) => setTxQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-bold text-sm text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">
                  {txType === "IN" ? "اسم المورد / المسؤول عن التوريد:" : "اسم الفني المستلم للقطعة:"}
                </label>
                <input
                  required
                  type="text"
                  placeholder="مثال: المهندس أحمد / شركة الموردين"
                  value={txRecipient}
                  onChange={(e) => setTxRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">
                  رقم أمر الصيانة / المرجع / رقم البلاغ:
                </label>
                <input
                  type="text"
                  placeholder="مثال: SS-1002"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">ملاحظات وتفاصيل الحركة:</label>
                <textarea
                  placeholder="ملاحظات توضيحية..."
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 h-20 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t justify-end">
                <button
                  type="button"
                  disabled={txLoading}
                  onClick={() => {
                    setShowTxModal(false);
                    setSelectedPart(null);
                    setTxQty(1);
                    setTxRecipient("");
                    setTxRef("");
                    setTxNotes("");
                    setTxError("");
                  }}
                  className="px-4 py-2 bg-gray-150 rounded-lg font-bold text-xs text-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={txLoading}
                  className={`px-5 py-2 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 ${
                    txType === "IN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {txLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {txType === "IN" ? "تأكيد التوريد وإدخال الرصيد" : "تأكيد صرف وخصم الرصيد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📋 PRINT VIEW FOR SPARE PARTS WAREHOUSE */}
      <div className="hidden print:block text-black font-sans text-right p-4 animate-fade-in" dir="rtl">
        <div className="text-center space-y-3 border-b-4 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold">مؤسسة عاصمة المجد الفنية لإدارة الأجهزة</h1>
          <h2 className="text-xl font-bold text-gray-700 underline">
            {activeTab === "CATALOG" 
              ? "تقرير جرد قطع الغيار المركزية بالمستودع" 
              : "سجل حركات وتوريد وصرف قطع الغيار"}
          </h2>
          <div className="flex justify-between items-center text-xs mt-3 px-4 font-bold text-gray-600">
            <span>تاريخ استخراج التقرير: {new Date().toLocaleString("ar-SA")}</span>
            <span>عدد البنود المطبوعة: {activeTab === "CATALOG" ? filteredParts.length : filteredTransactions.length} بند</span>
          </div>
        </div>

        {activeTab === "CATALOG" ? (
          <table className="min-w-full border-collapse border border-black text-xs text-right">
            <thead>
              <tr className="bg-gray-150 border-b-2 border-black font-bold">
                <th className="border border-black px-2 py-2 w-8 text-center">#</th>
                <th className="border border-black px-3 py-2 w-48">كود الصنف (SKU)</th>
                <th className="border border-black px-3 py-2">اسم قطعة الغيار</th>
                <th className="border border-black px-3 py-2">الموديلات المتوافقة</th>
                <th className="border border-black px-3 py-2 w-24 text-center">الكمية المتوفرة</th>
                <th className="border border-black px-3 py-2 w-24 text-center">سعر الوحدة</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part, index) => (
                <tr key={part.id} className="border-b border-black">
                  <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                  <td className="border border-black px-3 py-2 font-mono">{part.code}</td>
                  <td className="border border-black px-3 py-2 font-bold">{part.name}</td>
                  <td className="border border-black px-3 py-2">{part.compatibleModels}</td>
                  <td className="border border-black px-3 py-2 text-center font-bold">{part.quantity}</td>
                  <td className="border border-black px-3 py-2 text-center font-bold">{part.price ? `${part.price.toFixed(2)} ر.س` : "غير محدد"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full border-collapse border border-black text-xs text-right">
            <thead>
              <tr className="bg-gray-150 border-b-2 border-black font-bold">
                <th className="border border-black px-2 py-2 w-8 text-center">#</th>
                <th className="border border-black px-3 py-2 w-32">التاريخ والوقت</th>
                <th className="border border-black px-3 py-2 w-40">اسم القطعة (الكود)</th>
                <th className="border border-black px-3 py-2 w-24 text-center">نوع الحركة</th>
                <th className="border border-black px-3 py-2 w-16 text-center">الكمية</th>
                <th className="border border-black px-3 py-2">المسؤول / المستلم</th>
                <th className="border border-black px-3 py-2">رقم المرجع / البلاغ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => (
                <tr key={tx.id} className="border-b border-black">
                  <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                  <td className="border border-black px-3 py-2">{new Date(tx.date).toLocaleString("ar-SA")}</td>
                  <td className="border border-black px-3 py-2 font-bold">{tx.part?.name} ({tx.part?.code})</td>
                  <td className="border border-black px-3 py-2 text-center">{tx.type === "IN" ? "توريد مخزني" : "صرف صيانة"}</td>
                  <td className="border border-black px-3 py-2 text-center font-bold">{tx.quantity}</td>
                  <td className="border border-black px-3 py-2 font-bold">{tx.recipient}</td>
                  <td className="border border-black px-3 py-2 font-mono">{tx.reference || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* signatures */}
        <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-dashed border-gray-400 text-center text-xs">
          <div className="space-y-4">
            <p className="font-bold">توقيع فني/مسؤول المستودع</p>
            <div className="h-8"></div>
            <p className="text-gray-400">________________________</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold">اعتماد الإدارة الفنية والفرز</p>
            <div className="h-8"></div>
            <p className="text-gray-400">________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}
