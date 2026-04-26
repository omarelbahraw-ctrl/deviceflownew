"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Check,
  Trash2,
  Camera,
  FileText,
  Package,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Save,
} from "lucide-react";
import { createTrader } from "@/app/traders/actions";
import { createBatchWithDevices, DeviceEntry } from "./actions";

type Trader = { id: string; name: string; phone: string | null };

const DEVICE_TYPES = ["شاشات", "مكيفات", "برادات", "غسالات", "أجهزة ذكية", "أخرى"];
const FAULT_TYPES = [
  "يعمل (لا يوجد عطل)",
  "لا يعمل نهائياً",
  "مكسور",
  "خط في الشاشة",
  "دوت (نقطة)",
  "عطل بانل",
  "أخرى",
];

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  // Form fields for adding a new device
  const [deviceType, setDeviceType] = useState(DEVICE_TYPES[0]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [inspectionResult, setInspectionResult] = useState("MATCH");
  const [faultType, setFaultType] = useState(FAULT_TYPES[0]);
  const [accessoriesStatus, setAccessoriesStatus] = useState("كامل ملحقاته والكرتون سليم");
  const [notes, setNotes] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 3 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Add device to local list
  const handleAddDevice = () => {
    if (!serialNumber.trim()) {
      setError("يرجى إدخال رقم السيريال");
      return;
    }
    if (!brand.trim()) {
      setError("يرجى إدخال البراند");
      return;
    }
    if (!model.trim()) {
      setError("يرجى إدخال الموديل");
      return;
    }

    // Check local duplicates
    if (devices.some((d) => d.serialNumber === serialNumber.trim())) {
      setError("رقم السيريال مضاف بالفعل في هذا الإذن!");
      return;
    }

    const newDevice: DeviceEntry = {
      id: `temp-${Date.now()}`,
      deviceType,
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      inspectionResult,
      faultType,
      accessoriesStatus,
      notes: notes.trim(),
      imageBase64,
    };

    setDevices([...devices, newDevice]);
    setError("");

    // Reset form for next entry
    setBrand("");
    setModel("");
    setSerialNumber("");
    setNotes("");
    setImageBase64(null);
    setImagePreview(null);
    setInspectionResult("MATCH");
    setFaultType(FAULT_TYPES[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Focus serial number for quick next entry
    setTimeout(() => serialInputRef.current?.focus(), 100);
  };

  // Remove device from list
  const removeDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
  };

  // Save the entire batch
  const handleSaveBatch = async () => {
    if (!selectedTraderId) {
      setError("يرجى اختيار العميل أولاً");
      return;
    }
    if (devices.length === 0) {
      setError("يرجى إضافة بند واحد على الأقل");
      return;
    }

    setIsSaving(true);
    setError("");

    const finalTraderId = selectedTraderId.startsWith("temp-")
      ? traders.find((t) => t.id === selectedTraderId)?.name || ""
      : selectedTraderId;

    const res = await createBatchWithDevices(finalTraderId, devices);
    if (res?.error) {
      setError(res.error);
      setIsSaving(false);
    } else {
      router.push("/batches");
      router.refresh();
    }
  };

  // Handle new trader
  const handleAddTrader = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createTrader(formData);
    if (res?.error) {
      alert(res.error);
    } else {
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const tempId = "temp-" + Date.now();
      setTraders([...traders, { id: tempId, name, phone }]);
      setSelectedTraderId(tempId);
      setIsPopupOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              إنشاء إذن استلام جديد
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              اختر العميل ثم أضف البنود واحداً تلو الآخر مع ملاحظات الفحص
            </p>
          </div>
          {devices.length > 0 && (
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-200">
              <Package className="h-4 w-4 inline ml-1" />
              {devices.length} بند مضاف
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Step 1: Customer Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            ① اختر العميل (التاجر) *
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedTraderId}
              onChange={(e) => setSelectedTraderId(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- اختر العميل من القائمة --</option>
              {traders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.phone ? `(${t.phone})` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsPopupOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
            >
              <Plus className="h-5 w-5" /> إضافة عميل جديد
            </button>
          </div>
        </div>

        {/* Step 2: Add Devices Form */}
        <div
          className={`transition-all duration-300 ${
            selectedTraderId ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-indigo-50 to-white border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" />
                ② إضافة بند جديد
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">نوع الجهاز *</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    {DEVICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">البراند *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    list="brands"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    placeholder="مثال: Samsung"
                  />
                  <datalist id="brands">
                    {uniqueBrands.map((b) => (<option key={b} value={b} />))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الموديل *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    list="models"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    placeholder="الموديل..."
                  />
                  <datalist id="models">
                    {uniqueModels.map((m) => (<option key={m} value={m} />))}
                  </datalist>
                </div>
              </div>

              {/* Serial Number - prominent */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  رقم السيريال (الباركود) *
                </label>
                <input
                  ref={serialInputRef}
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDevice();
                    }
                  }}
                  className="w-full rounded-lg border-2 border-indigo-200 px-4 py-4 text-lg font-mono tracking-widest uppercase bg-yellow-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="قم بمسح الباركود هنا..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">القرار الفني *</label>
                  <select
                    value={inspectionResult}
                    onChange={(e) => setInspectionResult(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-3 bg-gray-50"
                  >
                    <option value="MATCH">✅ مطابق (سليم ومقبول)</option>
                    <option value="NOT_MATCH">❌ غير مطابق (مرفوض / مخفض)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">العطل (إن وجد)</label>
                  <select
                    value={faultType}
                    onChange={(e) => setFaultType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    {FAULT_TYPES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الملحقات والكرتون</label>
                  <select
                    value={accessoriesStatus}
                    onChange={(e) => setAccessoriesStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    <option value="كامل ملحقاته والكرتون سليم">كامل سليم</option>
                    <option value="غير كامل ملحقاته">نواقص</option>
                    <option value="بدون ملحقات">بدون</option>
                  </select>
                </div>
              </div>

              {/* Notes & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظات الفحص</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 min-h-[100px] resize-y"
                    placeholder="أضف ملاحظات الفحص هنا... (اختياري)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <Camera className="h-4 w-4 inline ml-1" /> صورة حالة الجهاز
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors min-h-[100px] flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="معاينة"
                          className="max-h-20 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageBase64(null);
                            setImagePreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-green-600 mt-1 font-bold">✓ تم رفع الصورة</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">اضغط لرفع صورة</p>
                        <p className="text-xs text-gray-400">أقصى حجم: 3 ميجابايت</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddDevice}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border-2 border-dashed border-indigo-300 rounded-xl text-lg font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 transition-all"
              >
                <Plus className="h-6 w-6" /> إضافة هذا البند للإذن
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Added Devices List */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-green-50 to-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                ③ البنود المضافة ({devices.length} بند)
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {devices.map((device, index) => (
                <div key={device.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Main row */}
                  <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Number badge */}
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* Image thumbnail */}
                      {device.imageBase64 && (
                        <img
                          src={device.imageBase64}
                          alt="صورة الجهاز"
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                      )}

                      {/* Device info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">
                            {device.brand} - {device.model}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {device.deviceType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {device.serialNumber}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              device.inspectionResult === "MATCH"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {device.inspectionResult === "MATCH" ? "✅ مطابق" : "❌ غير مطابق"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDevice(expandedDevice === device.id ? null : device.id)
                        }
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        {expandedDevice === device.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDevice(device.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف البند"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedDevice === device.id && (
                    <div className="px-6 pb-4 mr-14 bg-gray-50 rounded-lg mx-4 mb-3 p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="block text-xs text-gray-500">العطل</span>
                          <span className="font-bold text-gray-800">{device.faultType}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">الملحقات</span>
                          <span className="font-bold text-gray-800">{device.accessoriesStatus}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-xs text-gray-500">ملاحظات الفحص</span>
                          <span className="font-bold text-gray-800">
                            {device.notes || "—لا توجد ملاحظات—"}
                          </span>
                        </div>
                      </div>
                      {device.imageBase64 && (
                        <div className="mt-3">
                          <span className="block text-xs text-gray-500 mb-1">صورة الجهاز</span>
                          <img
                            src={device.imageBase64}
                            alt="صورة الجهاز"
                            className="max-h-48 rounded-lg object-cover border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="p-6 bg-gradient-to-l from-green-50 to-white border-t border-gray-100">
              <button
                type="button"
                onClick={handleSaveBatch}
                disabled={isSaving || devices.length === 0}
                className="w-full flex justify-center items-center gap-3 py-5 px-6 border border-transparent rounded-2xl shadow-lg text-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-all hover:shadow-xl"
              >
                {isSaving ? (
                  "جاري حفظ الإذن..."
                ) : (
                  <>
                    <Save className="h-7 w-7" />
                    حفظ الإذن ({devices.length} بند)
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                بعد الحفظ سيتم تحويلك لقسم سجل الأذونات ويمكنك الاطلاع عليه في أي وقت.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Popup: New Trader */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900">إضافة عميل جديد سريعاً</h3>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTrader} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم العميل/التاجر *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <input type="hidden" name="address" value="تمت الإضافة من الإدخال السريع" />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold rounded-lg px-4 py-3 mt-4 hover:bg-indigo-700 transition-colors"
              >
                حفظ واختيار العميل
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
