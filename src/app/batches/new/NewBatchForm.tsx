"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Plus, X, Check } from "lucide-react";
import { createTrader } from "@/app/traders/actions";
import { createBatchAndReceiveDevice } from "./actions";

type Trader = { id: string; name: string; phone: string | null };

export default function NewBatchForm({
  traders: initialTraders,
  uniqueBrands,
  uniqueModels,
}: {
  traders: Trader[];
  uniqueBrands: string[];
  uniqueModels: string[];
}) {
  const router = useRouter();
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [selectedTraderId, setSelectedTraderId] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const DEVICE_TYPES = ["شاشات", "مكيفات", "برادات", "غسالات", "أجهزة ذكية", "أخرى"];
  const FAULT_TYPES = ["يعمل (لا يوجد عطل)", "لا يعمل نهائياً", "مكسور", "خط في الشاشة", "دوت (نقطة)", "عطل بانل", "أخرى"];

  // Handle new trader addition
  const handleAddTrader = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createTrader(formData);
    
    if (res?.error) {
      alert(res.error);
    } else {
      // Fast refresh simulation for better UX (We'll get the real data after refresh)
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const tempId = "temp-" + Date.now();
      
      setTraders([...traders, { id: tempId, name, phone }]);
      setSelectedTraderId(tempId);
      setIsPopupOpen(false);
      router.refresh(); // Fetch actual ID in the background
    }
  };

  // Handle unified batch and device creation
  const handleSubmitDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTraderId) {
      setError("الرجاء اختيار العميل أولاً");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    // Append trader ID safely (handles our temp ID hack by relying on name if temp)
    const finalTraderId = selectedTraderId.startsWith("temp-") 
      ? traders.find(t => t.id === selectedTraderId)?.name || "" 
      : selectedTraderId;

    formData.append("traderIdOrName", finalTraderId);

    const res = await createBatchAndReceiveDevice(formData);
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else if (res?.batchId) {
      // Redirect to the batch page to continue adding
      router.push(`/batches/${res.batchId}`);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmitDevice} className="p-6 space-y-8">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          {/* Section 1: Trader Selection */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <label className="block text-sm font-bold text-gray-800 mb-3">اختر العميل (التاجر) *</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedTraderId}
                onChange={(e) => setSelectedTraderId(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- اختر العميل من القائمة --</option>
                {traders.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} {t.phone ? `(${t.phone})` : ""}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsPopupOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-bold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-5 w-5" /> إضافة عميل جديد
              </button>
            </div>
          </div>

          {/* Section 2: Device Entry (Only visible if trader is selected) */}
          <div className={`transition-opacity duration-300 ${selectedTraderId ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-5 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-500" />
              بيانات أول جهاز يتم استلامه
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نوع الجهاز *</label>
                <select name="deviceType" required className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm">
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">البراند *</label>
                <input type="text" name="brand" required list="brands" className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm" placeholder="مثال: Samsung" />
                <datalist id="brands">{uniqueBrands.map(b => <option key={b} value={b} />)}</datalist>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الموديل *</label>
                <input type="text" name="model" required list="models" className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm font-mono" placeholder="الموديل..." />
                <datalist id="models">{uniqueModels.map(m => <option key={m} value={m} />)}</datalist>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم السيريال (الباركود) *</label>
                <input type="text" name="serialNumber" required className="w-full rounded-md border-2 border-indigo-200 px-4 py-4 text-lg font-mono tracking-widest uppercase bg-yellow-50 focus:border-indigo-500" placeholder="قم بمسح الباركود هنا..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">القرار الفني *</label>
                <select name="inspectionResult" required className="w-full rounded-md border-2 border-gray-300 px-3 py-3 font-bold text-sm bg-gray-50">
                  <option value="MATCH">✅ مطابق (سليم ومقبول)</option>
                  <option value="NOT_MATCH">❌ غير مطابق (مرفوض / مخفض)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">العطل (إن وجد)</label>
                <select name="faultType" className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm">
                  {FAULT_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الملحقات والكرتون</label>
                <select name="accessoriesStatus" className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm">
                  <option value="كامل ملحقاته والكرتون سليم">كامل سليم</option>
                  <option value="غير كامل ملحقاته">نواقص</option>
                  <option value="بدون ملحقات">بدون</option>
                </select>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isSubmitting || !selectedTraderId}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                {isSubmitting ? "جاري الحفظ..." : <><Check className="h-6 w-6" /> فتح الإذن وحفظ الجهاز معاً</>}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">سيتم إنشاء رقم إذن جديد وتوجيهك لتكملة باقي الأجهزة فوراً.</p>
            </div>
          </div>
        </form>
      </div>

      {/* Popup Modal for New Trader */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900">إضافة عميل جديد سريعاً</h3>
              <button onClick={() => setIsPopupOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTrader} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل/التاجر *</label>
                <input type="text" name="name" required className="w-full border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 border" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                <input type="tel" name="phone" className="w-full border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 border" />
              </div>
              <input type="hidden" name="address" value="تمت الإضافة من الإدخال السريع" />
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold rounded-lg px-4 py-3 mt-4 hover:bg-indigo-700 transition-colors">
                حفظ واختيار العميل
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
