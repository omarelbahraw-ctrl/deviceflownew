import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, QrCode, ClipboardCheck, Trash2, ShieldAlert, PackageOpen, AlertTriangle } from "lucide-react";
import { receiveDevice } from "./receive/actions";
import { closeBatch } from "../actions";

export default async function BatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const batch = await prisma.batch.findUnique({
    where: { id: resolvedParams.id },
    include: {
      trader: true,
      devices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!batch) notFound();

  const DEVICE_TYPES = ["شاشات", "مكيفات", "برادات", "غسالات", "أجهزة ذكية", "أخرى"];
  const FAULT_TYPES = ["يعمل (لا يوجد عطل)", "لا يعمل نهائياً", "مكسور", "خط في الشاشة", "دوت (نقطة)", "عطل بانل", "أخرى"];

  // Unique models & brands for datalists to speed up entry
  const existingDevices = await prisma.device.findMany({ select: { brand: true, model: true } });
  const uniqueBrands = Array.from(new Set(existingDevices.map(d => d.brand)));
  const uniqueModels = Array.from(new Set(existingDevices.map(d => d.model)));

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/batches" className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-indigo-50 text-gray-600 transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              إذن استلام: <span className="text-indigo-600 font-mono">{batch.id.substring(batch.id.length - 6).toUpperCase()}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              التاجر: <Link href={`/traders/${batch.trader.id}`} className="font-semibold hover:underline text-gray-700">{batch.trader.name}</Link> | 
              تاريخ الإذن: {new Date(batch.date).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg text-center min-w-[100px]">
            <span className="block text-xs text-indigo-600 font-semibold">المستلم</span>
            <span className="block text-xl font-bold text-indigo-800">{batch.devices.length}</span>
          </div>
          
          {batch.status !== 'CLOSED' ? (
            <form action={async () => {
              "use server";
              await closeBatch(batch.id);
            }}>
              <button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                حفظ وإغلاق الإذن
              </button>
            </form>
          ) : (
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-green-200">
              <ShieldAlert className="h-5 w-5" /> مغلق ونهائي
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Fast Entry Form (Only visible if open) */}
        {batch.status !== 'CLOSED' ? (
          <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit sticky top-6">
            <div className="bg-slate-900 border-b border-gray-800 p-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-400" />
                إضافة وفحص سريع
              </h2>
            </div>
            
            <form action={async (formData) => {
              "use server";
              await receiveDevice(formData);
            }} className="p-5 space-y-4">
              <input type="hidden" name="batchId" value={batch.id} />
              <input type="hidden" name="traderId" value={batch.trader.id} />
              <input type="hidden" name="batchItemId" value="DIRECT" /> {/* Bypassing expected items */}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">نوع الجهاز *</label>
                <select name="deviceType" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البراند *</label>
                  <input type="text" name="brand" required list="brands" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Samsung..." />
                  <datalist id="brands">{uniqueBrands.map(b => <option key={b} value={b} />)}</datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الموديل *</label>
                  <input type="text" name="model" required list="models" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="الموديل..." />
                  <datalist id="models">{uniqueModels.map(m => <option key={m} value={m} />)}</datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <QrCode className="h-3 w-3" /> السيريال (Barcode) *
                </label>
                <input type="text" name="serialNumber" required autoFocus className="w-full rounded-md border-2 border-indigo-200 px-3 py-2 text-sm font-mono uppercase bg-yellow-50 focus:border-indigo-500" placeholder="مسح الباركود..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">حالة الجهاز</label>
                  <select name="condition" className="w-full rounded-md border border-gray-300 px-2 py-2 text-xs">
                    <option value="NEW">جديد</option>
                    <option value="USED">مستعمل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الملحقات</label>
                  <select name="accessoriesStatus" className="w-full rounded-md border border-gray-300 px-2 py-2 text-xs">
                    <option value="كامل ملحقاته">كامل</option>
                    <option value="غير كامل ملحقاته">ناقص</option>
                    <option value="بدون ملحقات">بدون</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">القرار الفني *</label>
                <select name="inspectionResult" required className="w-full rounded-md border-2 border-gray-300 px-3 py-2 font-bold text-sm bg-gray-50">
                  <option value="MATCH">✅ مطابق (سليم)</option>
                  <option value="NOT_MATCH">❌ غير مطابق (عطل/مرتجع)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العطل (إن وجد)</label>
                <select name="faultType" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600">
                  {FAULT_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                + إضافة وفحص (خطوة واحدة)
              </button>
            </form>
          </div>
        ) : (
          <div className="xl:col-span-1 bg-green-50 rounded-xl border border-green-200 p-8 flex flex-col items-center justify-center text-center h-fit">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-green-800">تم إغلاق الإذن</h3>
            <p className="text-sm text-green-600 mt-2">عملية الفحص والاستلام اكتملت. الأجهزة الآن في المخزون.</p>
          </div>
        )}

        {/* Devices List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-slate-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-indigo-500" />
                سجل الأجهزة المفحوصة
              </h3>
            </div>
            
            <div className="overflow-x-auto p-4">
              {batch.devices.length === 0 ? (
                <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <QrCode className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-lg font-medium">ابدأ بمسح الأجهزة لإضافتها هنا تلقائياً</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-right">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-3 py-3 text-xs font-bold text-gray-500">الجهاز والموديل</th>
                      <th className="px-3 py-3 text-xs font-bold text-gray-500">السيريال</th>
                      <th className="px-3 py-3 text-xs font-bold text-gray-500">الفحص</th>
                      <th className="px-3 py-3 text-xs font-bold text-gray-500">التفاصيل</th>
                      {batch.status !== 'CLOSED' && <th className="px-3 py-3 text-xs font-bold text-gray-500">إجراء</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batch.devices.map(device => (
                      <tr key={device.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-gray-900 font-bold">
                          {device.type} <br/> <span className="text-gray-500 font-normal text-xs">{device.brand} - {device.model}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-indigo-600 font-mono font-bold bg-indigo-50/30 rounded">{device.serialNumber || 'بدون'}</td>
                        <td className="px-3 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${device.inspectionResult === 'MATCH' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {device.inspectionResult === 'MATCH' ? 'مطابق' : 'غير مطابق'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {device.inspectionResult === 'NOT_MATCH' ? <span className="text-red-600 font-bold block">{device.faultType}</span> : 'سليم'}
                          <span className="block text-gray-400 mt-1">{device.accessoriesStatus}</span>
                        </td>
                        {batch.status !== 'CLOSED' && (
                          <td className="px-3 py-3 text-sm">
                            <form action={async () => {
                              "use server";
                              await prisma.device.delete({ where: { id: device.id } });
                            }}>
                              <button type="submit" className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
