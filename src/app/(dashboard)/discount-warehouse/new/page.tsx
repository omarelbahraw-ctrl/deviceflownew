"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Tags,
  Camera,
  Image as ImageIcon,
  X,
  Save,
} from "lucide-react";
import { createDiscountItem } from "../actions";
import { getSystemSettings } from "@/app/(dashboard)/settings/actions";
import { DEFAULT_SETTINGS } from "@/app/(dashboard)/settings/constants";

export default function NewDiscountItemPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [deviceTypes, setDeviceTypes] = useState<string[]>(DEFAULT_SETTINGS.DEVICE_TYPES);
  const [knownBrands, setKnownBrands] = useState<string[]>(DEFAULT_SETTINGS.KNOWN_BRANDS);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState(DEFAULT_SETTINGS.DEVICE_TYPES[0]);
  const [serialNumber, setSerialNumber] = useState("");
  const [category, setCategory] = useState("B");
  const [workingStatus, setWorkingStatus] = useState("WORKING");
  const [previousIssue, setPreviousIssue] = useState("");
  const [repairDone, setRepairDone] = useState("");
  const [accessories, setAccessories] = useState("");
  const [displayNotes, setDisplayNotes] = useState("");
  const [priceBefore, setPriceBefore] = useState("");
  const [priceAfter, setPriceAfter] = useState("");
  const [repairCost, setRepairCost] = useState("");

  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    getSystemSettings().then((settings) => {
      setDeviceTypes(settings.DEVICE_TYPES);
      setKnownBrands(settings.KNOWN_BRANDS);
      if (!type && settings.DEVICE_TYPES.length > 0) {
        setType(settings.DEVICE_TYPES[0]);
      }
    });
  }, []);


  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("الحجم الأقصى 3 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images];
      newImages[index] = reader.result as string;
      setImages(newImages);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    if (fileRefs[index].current) fileRefs[index].current!.value = "";
  };

  const handleSave = async () => {
    if (!brand || !serialNumber) {
      setError("البراند ورقم السيريال مطلوبان");
      return;
    }
    setIsSaving(true);
    setError("");

    const res = await createDiscountItem({
      brand,
      model,
      type,
      serialNumber: serialNumber.toUpperCase(),
      category,
      workingStatus,
      previousIssue,
      repairDone,
      accessories,
      displayNotes,
      priceBefore: priceBefore ? parseFloat(priceBefore) : null,
      priceAfter: priceAfter ? parseFloat(priceAfter) : null,
      repairCost: repairCost ? parseFloat(repairCost) : null,
      image1: images[0],
      image2: images[1],
      image3: images[2],
    });

    if (res.error) {
      setError(res.error);
      setIsSaving(false);
    } else {
      router.push("/discount-warehouse");
      router.refresh();
    }
  };

  const imageLabels = ["📱 صورة الجهاز", "📷 صورة إضافية", "🔌 صورة الملحقات"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/discount-warehouse"
          className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-indigo-50 text-gray-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="h-6 w-6 text-amber-600" />
            إضافة جهاز للمستودع المخفّض
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Device Info */}
        <h3 className="font-bold text-gray-800 border-b pb-2">بيانات الجهاز</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">النوع</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3">
              {deviceTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">البراند *</label>
            <input list="knownBrands" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="مثال: سرين" />
            <datalist id="knownBrands">
              {knownBrands.map((b) => (<option key={b} value={b} />))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">الموديل</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="الموديل..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">رقم السيريال *</label>
          <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full rounded-lg border-2 border-amber-200 px-4 py-3 font-mono tracking-wider uppercase bg-amber-50" placeholder="رقم السيريال..." />
        </div>

        {/* Grade & Status */}
        <h3 className="font-bold text-gray-800 border-b pb-2 pt-2">الدرجة والحالة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الدرجة (التصنيف)</label>
            <div className="flex gap-3">
              {(["A", "B", "C"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setCategory(g)}
                  className={`flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-all ${
                    category === g
                      ? g === "A" ? "bg-green-100 border-green-500 text-green-700"
                        : g === "B" ? "bg-amber-100 border-amber-500 text-amber-700"
                        : "bg-red-100 border-red-500 text-red-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">A = ممتاز | B = جيد | C = اقتصادي</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">حالة التشغيل</label>
            <select value={workingStatus} onChange={(e) => setWorkingStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3">
              <option value="WORKING">يعمل بشكل كامل</option>
              <option value="MINOR_ISSUE">يعمل مع ملاحظة بسيطة</option>
              <option value="NEEDS_REPAIR">يحتاج إصلاح إضافي</option>
            </select>
          </div>
        </div>

        {/* Repair Details */}
        <h3 className="font-bold text-gray-800 border-b pb-2 pt-2">تفاصيل الإصلاح</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">المشكلة السابقة</label>
            <textarea value={previousIssue} onChange={(e) => setPreviousIssue(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3 min-h-[80px]" placeholder="وصف المشكلة الأصلية..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ما تم إصلاحه</label>
            <textarea value={repairDone} onChange={(e) => setRepairDone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3 min-h-[80px]" placeholder="تفاصيل الإصلاح..." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">الملحقات المتاحة</label>
            <input type="text" value={accessories} onChange={(e) => setAccessories(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="ريموت، قاعدة، كابل..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظات إضافية</label>
            <input type="text" value={displayNotes} onChange={(e) => setDisplayNotes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="أي ملاحظات..." />
          </div>
        </div>

        {/* Prices */}
        <h3 className="font-bold text-gray-800 border-b pb-2 pt-2">الأسعار</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">السعر الأصلي</label>
            <input type="number" value={priceBefore} onChange={(e) => setPriceBefore(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">سعر البيع المخفّض</label>
            <input type="number" value={priceAfter} onChange={(e) => setPriceAfter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">تكلفة الإصلاح</label>
            <input type="number" value={repairCost} onChange={(e) => setRepairCost(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" placeholder="0" />
          </div>
        </div>

        {/* Images */}
        <h3 className="font-bold text-gray-800 border-b pb-2 pt-2">
          <Camera className="h-4 w-4 inline ml-1" /> صور الجهاز
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => (
            <div key={idx}>
              <label className="block text-xs font-bold text-gray-600 mb-1">{imageLabels[idx]}</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors min-h-[120px] flex flex-col items-center justify-center"
                onClick={() => fileRefs[idx].current?.click()}
              >
                {images[idx] ? (
                  <div className="relative">
                    <img src={images[idx]!} alt="" className="max-h-24 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">اضغط لرفع</p>
                  </>
                )}
              </div>
              <input ref={fileRefs[idx]} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImageUpload(idx, e)} />
            </div>
          ))}
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 transition-all"
        >
          {isSaving ? "جاري الحفظ..." : <><Save className="h-6 w-6" /> حفظ الجهاز في المستودع</>}
        </button>
      </div>
    </div>
  );
}
