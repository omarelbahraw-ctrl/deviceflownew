"use client";

import { Printer, MessageSquare, Send, Share2 } from "lucide-react";

interface BatchActionsClientProps {
  batchId: string;
  traderName: string;
  reportNumber: string | null;
  representative: string | null;
  devices: Array<{
    brand: string;
    model: string;
    serialNumber: string;
    inspectionResult: string;
    decision: string;
    faultType: string | null;
    notes: string | null;
  }>;
}

export default function BatchActionsClient({
  batchId,
  traderName,
  reportNumber,
  representative,
  devices,
}: BatchActionsClientProps) {
  
  const generateMessageText = () => {
    let text = `📄 بيان استلام أجهزة (عاصمة المجد)\n\n`;
    text += `👤 التاجر/العميل: ${traderName}\n`;
    if (reportNumber) text += `🔢 رقم البلاغ: ${reportNumber}\n`;
    if (representative) text += `🚚 المندوب: ${representative}\n`;
    text += `📅 إذن رقم: B-${batchId.substring(batchId.length - 6).toUpperCase()}\n`;
    text += `📦 إجمالي الأجهزة: ${devices.length}\n`;
    text += `-----------------------------------\n\n`;

    devices.forEach((d, index) => {
      const statusSymbol = d.inspectionResult === "MATCH" ? "✅ مطابق" : "❌ غير مطابق";
      let decisionLabel = "قيد الانتظار";
      if (d.decision === "ACCEPT") decisionLabel = "مقبول ومستلم";
      else if (d.decision === "IN_WORKSHOP") decisionLabel = "محول للورشة";
      else if (d.decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE") decisionLabel = "مستلم بتعميد";
      else if (d.decision === "NON_COMPLIANT_NOT_RECEIVED") decisionLabel = "مرفوض لم يستلم";

      text += `${index + 1}️⃣ ${d.brand} - ${d.model}\n`;
      text += `🏷️ السيريال: ${d.serialNumber}\n`;
      text += `🔍 الفحص: ${statusSymbol} (${decisionLabel})\n`;
      if (d.faultType && d.faultType !== "يعمل (لا يوجد عطل)") {
        text += `⚠️ العطل: ${d.faultType}\n`;
      }
      if (d.notes) {
        text += `📝 ملاحظات: ${d.notes}\n`;
      }
      text += `-----------------------------------\n\n`;
    });

    return encodeURIComponent(text);
  };

  const shareWhatsApp = () => {
    const text = generateMessageText();
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareSMS = () => {
    const text = generateMessageText();
    window.open(`sms:?body=${text}`, "_blank");
  };

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
      >
        <Printer className="h-4.5 w-4.5" />
        طباعة بيان المندوب
      </button>

      <button
        onClick={shareWhatsApp}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
      >
        <MessageSquare className="h-4.5 w-4.5" />
        مشاركة عبر الواتساب
      </button>

      <button
        onClick={shareSMS}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer"
      >
        <Send className="h-4.5 w-4.5" />
        إرسال رسالة نصية SMS
      </button>
    </div>
  );
}
