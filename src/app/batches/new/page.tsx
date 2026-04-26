import { prisma } from "@/lib/prisma";
import NewBatchForm from "./NewBatchForm";

export default async function NewBatchPage() {
  const traders = await prisma.trader.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });

  const existingDevices = await prisma.device.findMany({ select: { brand: true, model: true } });
  const uniqueBrands = Array.from(new Set(existingDevices.map(d => d.brand)));
  const uniqueModels = Array.from(new Set(existingDevices.map(d => d.model)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">إضافة إذن استلام جديد</h1>
        <p className="text-gray-500 text-sm">حدد العميل أو أضف عميلاً جديداً وابدأ فوراً بتسجيل الأجهزة في خطوة واحدة.</p>
      </div>

      <NewBatchForm 
        traders={traders} 
        uniqueBrands={uniqueBrands} 
        uniqueModels={uniqueModels} 
      />
    </div>
  );
}
