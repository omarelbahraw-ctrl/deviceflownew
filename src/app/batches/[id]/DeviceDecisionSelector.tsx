"use client";

import { useState } from "react";
import { updateDeviceDecision } from "../actions";
import { Loader2, Check } from "lucide-react";

interface DeviceDecisionSelectorProps {
  deviceId: string;
  currentDecision: string;
  batchId: string;
  isClosed: boolean;
}

export const DECISION_LABELS: Record<string, string> = {
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

export const DECISION_COLORS: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-300",
  ACCEPT: "bg-green-50 text-green-700 border-green-300",
  IN_WORKSHOP: "bg-blue-50 text-blue-700 border-blue-300",
  READY_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border-indigo-300",
  REPAIRED_AND_DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-300",
  REPAIRED_BUT_REJECTED: "bg-rose-50 text-rose-700 border-rose-300",
  REJECTED_AND_DELIVERY_REJECTED: "bg-red-50 text-red-700 border-red-300",
  NON_COMPLIANT_NOT_RECEIVED: "bg-orange-50 text-orange-700 border-orange-300",
  NON_COMPLIANT_RECEIVED_WITH_OVERRIDE: "bg-amber-50 text-amber-700 border-amber-300",
  RETURNED_COMPLIANT: "bg-purple-50 text-purple-700 border-purple-300",
};

export default function DeviceDecisionSelector({
  deviceId,
  currentDecision,
  batchId,
  isClosed,
}: DeviceDecisionSelectorProps) {
  const [decision, setDecision] = useState(currentDecision);
  const [loading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDecision = e.target.value;
    setLoading(true);
    const res = await updateDeviceDecision(deviceId, newDecision, batchId);
    setLoading(false);

    if (res.success) {
      setDecision(newDecision);
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    } else {
      alert(res.error || "خطأ أثناء التحديث");
    }
  };

  if (isClosed) {
    return (
      <span className={`inline-block px-3 py-1.5 rounded-lg border text-xs font-bold ${DECISION_COLORS[decision] || "bg-gray-100 text-gray-700"}`}>
        {DECISION_LABELS[decision] || decision}
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <select
        value={decision}
        onChange={handleChange}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold cursor-pointer focus:outline-none transition-all ${
          DECISION_COLORS[decision] || "bg-gray-50 text-gray-700 border-gray-300"
        }`}
      >
        {Object.entries(DECISION_LABELS).map(([value, label]) => (
          <option key={value} value={value} className="bg-white text-gray-900 font-bold">
            {label}
          </option>
        ))}
      </select>

      {loading && (
        <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
      )}

      {showCheck && !loading && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow shadow-green-500/20 animate-scale-in">
          <Check className="h-3 w-3 stroke-[3]" />
        </span>
      )}
    </div>
  );
}
