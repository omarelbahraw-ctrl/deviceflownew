"use client";

import { useState, useRef, useEffect } from "react";
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
  Loader2,
  Scan,
  Video,
} from "lucide-react";
import { upload } from "@vercel/blob/client";
import { createTrader } from "@/app/(dashboard)/traders/actions";
import { createBatchWithDevices, DeviceEntry } from "./actions";
import { getSystemSettings } from "@/app/(dashboard)/settings/actions";
import { DEFAULT_SETTINGS } from "@/app/(dashboard)/settings/constants";
import { useTranslation } from "@/components/layout/LanguageContext";
import clsx from "clsx";

type Trader = { id: string; name: string; phone: string | null };

export default function NewBatchForm({
  traders: initialTraders,
  uniqueBrands,
  uniqueModels,
  nextReportNumber,
}: {
  traders: Trader[];
  uniqueBrands: string[];
  uniqueModels: string[];
  nextReportNumber: string;
}) {
  const router = useRouter();
  const { t, isRtl } = useTranslation();
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [selectedTraderId, setSelectedTraderId] = useState("");
  const [reportNumber, setReportNumber] = useState(nextReportNumber || "");
  const [representative, setRepresentative] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  // Barcode scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false); // Used as loading state now
  const barcodeFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenScanner = () => {
    barcodeFileInputRef.current?.click();
  };

  const handleBarcodeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScannerOpen(true); // Show loading spinner
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let decodedText = "";

      // Try 1: Direct scan of the original image
      try {
        const result = await reader.decodeFromImageElement(img);
        decodedText = result.getText();
      } catch (err) {
        console.log("Direct scan failed, trying resized canvas fallback...", err);
        // Try 2: Resize image to help ZXing find small/large barcodes
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1000;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const scaledImg = new Image();
          scaledImg.src = canvas.toDataURL("image/jpeg", 0.9);
          await new Promise((resolve) => { scaledImg.onload = resolve; });
          const result2 = await reader.decodeFromImageElement(scaledImg);
          decodedText = result2.getText();
        } else {
          throw new Error("Canvas context failed");
        }
      }
      
      if (decodedText) {
        setSerialNumber(decodedText);
        setTimeout(() => serialInputRef.current?.focus(), 100);
      } else {
        throw new Error("Barcode not found");
      }
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error(err);
      alert(isRtl ? "لم يتم العثور على باركود واضح في الصورة، جرب تصورها أقرب أو بشكل أوضح، أو تأكد من إضاءة المكان." : "No barcode found in image. Try getting closer, focusing better, or improving lighting.");
    } finally {
      setIsScannerOpen(false);
      if (barcodeFileInputRef.current) barcodeFileInputRef.current.value = "";
    }
  };

  const [deviceTypes, setDeviceTypes] = useState<string[]>(DEFAULT_SETTINGS.DEVICE_TYPES);
  const [knownBrands, setKnownBrands] = useState<string[]>(DEFAULT_SETTINGS.KNOWN_BRANDS);
  const [faultTypesList, setFaultTypesList] = useState<string[]>(DEFAULT_SETTINGS.FAULT_TYPES);

  // Form fields for adding a new device
  const [deviceType, setDeviceType] = useState(DEFAULT_SETTINGS.DEVICE_TYPES[0]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [inspectionResult, setInspectionResult] = useState("MATCH");
  const [faultType, setFaultType] = useState(DEFAULT_SETTINGS.FAULT_TYPES[0]);
  const [accessoriesStatus, setAccessoriesStatus] = useState("كامل ملحقاته والكرتون سليم");
  const [notes, setNotes] = useState("");
  const [discountCategory, setDiscountCategory] = useState("B");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSystemSettings().then((settings) => {
      setDeviceTypes(settings.DEVICE_TYPES);
      setKnownBrands(settings.KNOWN_BRANDS);
      setFaultTypesList(settings.FAULT_TYPES);
      
      if (!deviceType && settings.DEVICE_TYPES.length > 0) {
        setDeviceType(settings.DEVICE_TYPES[0]);
      }
      if (!faultType && settings.FAULT_TYPES.length > 0) {
        setFaultType(settings.FAULT_TYPES[0]);
      }
    });
  }, []);


  // Handle multiple media upload to Vercel Blob
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingMedia(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        newUrls.push(blob.url);
      }
      setMediaUrls((prev) => [...prev, ...newUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      alert(isRtl ? "حدث خطأ أثناء رفع الملفات. قد يكون الملف كبيراً جداً أو غير مدعوم. يرجى المحاولة مرة أخرى." : "Error uploading files. The file might be too large or unsupported. Please try again.");
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Add device to local list
  const handleAddDevice = () => {
    if (!serialNumber.trim()) {
      setError(t("new_batch_error_serial"));
      return;
    }
    if (!brand.trim()) {
      setError(t("new_batch_error_brand"));
      return;
    }
    if (!model.trim()) {
      setError(t("new_batch_error_model"));
      return;
    }

    // Check local duplicates
    if (devices.some((d) => d.serialNumber === serialNumber.trim())) {
      setError(t("new_batch_error_duplicate"));
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
      imageBase64: null,
      mediaUrls,
      discountCategory,
    };

    setDevices([...devices, newDevice]);
    setError("");

    // Reset form for next entry
    setBrand("");
    setModel("");
    setSerialNumber("");
    setNotes("");
    setMediaUrls([]);
    setInspectionResult("MATCH");
    setFaultType(faultTypesList[0] || "");
    setDiscountCategory("B");
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
      setError(t("new_batch_error_select_trader"));
      return;
    }
    if (devices.length === 0) {
      setError(t("new_batch_error_no_devices"));
      return;
    }

    setIsSaving(true);
    setError("");

    setIsSaving(true);
    setError("");

    const finalTraderId = selectedTraderId.startsWith("temp-")
      ? traders.find((t) => t.id === selectedTraderId)?.name || ""
      : selectedTraderId;

    try {
      const res = await createBatchWithDevices(finalTraderId, devices, reportNumber, representative);
      if (res?.error) {
        setError(res.error);
        setIsSaving(false);
      } else {
        router.push("/batches");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setError(isRtl ? "حدث خطأ أثناء الحفظ. قد يكون حجم الصور كبيراً جداً، يرجى المحاولة مرة أخرى أو تقليل عدد الصور." : "Error saving. Images might be too large. Try reducing image size or quantity.");
      setIsSaving(false);
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
              {t("new_batch_title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("new_batch_subtitle")}
            </p>
          </div>
          {devices.length > 0 && (
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-200">
              <Package className={clsx("h-4 w-4 inline", isRtl ? "ml-1" : "mr-1")} />
              {devices.length} {t("new_batch_items_added")}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Step 1: Customer Selection & Batch Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              {t("new_batch_select_trader_label")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedTraderId}
                onChange={(e) => setSelectedTraderId(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
              >
                <option value="">{t("new_batch_select_trader")}</option>
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
                <Plus className="h-5 w-5" /> {t("new_batch_btn_new_trader")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("new_batch_report_no_label")}
              </label>
              <input
                type="text"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t("new_batch_report_no_placeholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("new_batch_rep_label")}
              </label>
              <input
                type="text"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t("new_batch_rep_placeholder")}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Add Devices Form */}
        <div
          className={`transition-all duration-300 ${
            selectedTraderId ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={clsx("border-b border-gray-100 px-6 py-4", isRtl ? "bg-gradient-to-l from-indigo-50 to-white" : "bg-gradient-to-r from-indigo-50 to-white")}>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" />
                {t("new_batch_step2")}
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_device_type")}</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    {deviceTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_brand")}</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    list="brands"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    placeholder={isRtl ? "مثال: Samsung" : "e.g., Samsung"}
                  />
                  <datalist id="brands">
                    {Array.from(new Set([...knownBrands, ...uniqueBrands])).map((b) => (<option key={b} value={b} />))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_model")}</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    list="models"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    placeholder={isRtl ? "الموديل..." : "Model..."}
                  />
                  <datalist id="models">
                    {Array.from(new Set(["UA55TU7000", "GWC18QD", "OFT-2026", "NKI-43FHD", "SRN-500", ...uniqueModels])).map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Serial Number - prominent */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("new_batch_serial")}
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenScanner}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <Scan className="h-3.5 w-3.5" /> {isRtl ? "تصوير الباركود" : "Capture Barcode"}
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={barcodeFileInputRef} 
                    onChange={handleBarcodeImageUpload} 
                    className="hidden" 
                  />
                </div>
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
                  placeholder={t("new_batch_serial_placeholder")}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_result")}</label>
                  <select
                    value={inspectionResult}
                    onChange={(e) => setInspectionResult(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 px-3 py-3 bg-gray-50"
                  >
                    <option value="MATCH">{t("new_batch_result_match")}</option>
                    <option value="NOT_MATCH">{t("new_batch_result_not_match")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_fault")}</label>
                  <select
                    value={faultType}
                    onChange={(e) => setFaultType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    {faultTypesList.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_accessories")}</label>
                  <select
                    value={accessoriesStatus}
                    onChange={(e) => setAccessoriesStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    <option value="كامل ملحقاته والكرتون سليم">{t("new_batch_acc_full")}</option>
                    <option value="غير كامل ملحقاته">{t("new_batch_acc_missing")}</option>
                    <option value="بدون ملحقات">{t("new_batch_acc_none")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_category")}</label>
                  <select
                    value={discountCategory}
                    onChange={(e) => setDiscountCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 font-bold bg-white text-gray-900"
                  >
                    <option value="A">{t("rec_cat_a").split(" (")[0]}</option>
                    <option value="B">{t("rec_cat_b").split(" (")[0]}</option>
                    <option value="C">{t("rec_cat_c").split(" (")[0]}</option>
                  </select>
                </div>
              </div>

              {/* Notes & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t("new_batch_notes")}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 min-h-[100px] resize-y"
                    placeholder={isRtl ? "أضف ملاحظات الفحص هنا... (اختياري)" : "Add inspection notes here... (optional)"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    <Camera className={clsx("h-4 w-4 inline", isRtl ? "ml-1" : "mr-1")} /> {isRtl ? "صور وفيديو" : "Images & Video"}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        {url.match(/\.(mp4|webm|mov|quicktime)$/i) || url.includes('video') ? (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center">
                            <Video className="h-6 w-6 text-indigo-500 mb-1" />
                            <span className="text-[10px] text-gray-500 font-bold">Video</span>
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt={`Media ${idx}`}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border border-gray-200"
                          />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isUploadingMedia}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                        {isRtl ? "مكتبة / صور" : "Gallery / Photos"}
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingMedia}
                        onClick={() => videoInputRef.current?.click()}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                        {isRtl ? "تصوير فيديو" : "Record Video"}
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleMediaUpload}
                    disabled={isUploadingMedia}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleMediaUpload}
                    disabled={isUploadingMedia}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {isRtl ? "يمكنك رفع صور متعددة ومقاطع فيديو (بحد أقصى 50 ميجا)" : "You can upload multiple images and videos (max 50MB)"}
                  </p>
                </div>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddDevice}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border-2 border-dashed border-indigo-300 rounded-xl text-lg font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 transition-all"
              >
                <Plus className="h-6 w-6" /> {t("new_batch_btn_add_device")}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Added Devices List */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={clsx("border-b border-gray-100 px-6 py-4 flex items-center justify-between", isRtl ? "bg-gradient-to-l from-green-50 to-white" : "bg-gradient-to-r from-green-50 to-white")}>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                {t("new_batch_step3")} ({devices.length} {t("new_batch_items_added")})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {devices.map((device, index) => (
                <div key={device.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Main row */}
                  <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Number badge */}
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 mt-1 sm:mt-0">
                        {index + 1}
                      </div>

                      {/* Image thumbnail */}
                      {device.mediaUrls && device.mediaUrls.length > 0 && (
                        device.mediaUrls[0].match(/\.(mp4|webm|mov|quicktime)$/i) || device.mediaUrls[0].includes('video') ? (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-100 border border-gray-200 flex flex-col items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                            <Video className="h-5 w-5 text-indigo-500" />
                          </div>
                        ) : (
                          <img
                            src={device.mediaUrls[0]}
                            alt="Media"
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border border-gray-200 flex-shrink-0 mt-1 sm:mt-0"
                          />
                        )
                      )}

                      {/* Device info */}
                      <div className="min-w-0 flex-1">
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
                            {device.inspectionResult === "MATCH" ? (isRtl ? "✅ مطابق" : "✅ Matching") : (isRtl ? "❌ غير مطابق" : "❌ Non-matching")}
                          </span>
                          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {isRtl ? `فئة ${device.discountCategory || "B"}` : `Grade ${device.discountCategory || "B"}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:static absolute top-4 left-4 rtl:right-auto rtl:left-4 ltr:right-4 ltr:left-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDevice(expandedDevice === device.id ? null : device.id)
                        }
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={isRtl ? "عرض التفاصيل" : "View Details"}
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
                        title={t("wh_btn_delete")}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedDevice === device.id && (
                    <div className={clsx("pb-4 bg-gray-50 rounded-lg mx-4 mb-3 p-4", isRtl ? "mr-14" : "ml-14")}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="block text-xs text-gray-500">{t("new_batch_fault")}</span>
                          <span className="font-bold text-gray-800">{device.faultType}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">{t("new_batch_accessories")}</span>
                          <span className="font-bold text-gray-800">{device.accessoriesStatus}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">{t("new_batch_category").replace(" *", "")}</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                            {isRtl ? `فئة ${device.discountCategory || "B"}` : `Grade ${device.discountCategory || "B"}`}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">{t("new_batch_notes")}</span>
                          <span className="font-bold text-gray-800">
                            {device.notes || (isRtl ? "—لا توجد ملاحظات—" : "—No notes—")}
                          </span>
                        </div>
                      </div>
                      {device.mediaUrls && device.mediaUrls.length > 0 && (
                        <div className="mt-3">
                          <span className="block text-xs text-gray-500 mb-1">{isRtl ? "الوسائط" : "Media"}</span>
                          <div className="flex flex-wrap gap-2">
                            {device.mediaUrls.map((url, i) => (
                              <div key={i}>
                                {url.match(/\.(mp4|webm|mov|quicktime)$/i) || url.includes('video') ? (
                                  <video src={url} controls className="max-h-48 rounded-lg object-cover border border-gray-200 max-w-xs" />
                                ) : (
                                  <img src={url} alt={`Media ${i}`} className="max-h-48 rounded-lg object-cover border border-gray-200" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className={clsx("p-6 border-t border-gray-100", isRtl ? "bg-gradient-to-l from-green-50 to-white" : "bg-gradient-to-r from-green-50 to-white")}>
              <button
                type="button"
                onClick={handleSaveBatch}
                disabled={isSaving || devices.length === 0}
                className="w-full flex justify-center items-center gap-3 py-5 px-6 border border-transparent rounded-2xl shadow-lg text-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-all hover:shadow-xl"
              >
                {isSaving ? (
                  t("new_batch_saving")
                ) : (
                  <>
                    <Save className={clsx("h-7 w-7", isRtl ? "ml-2" : "mr-2")} />
                    {t("new_batch_btn_save_batch")} ({devices.length} {t("new_batch_items_added")})
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                {t("new_batch_save_info")}
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
              <h3 className="font-bold text-gray-900">{t("new_batch_quick_add_trader")}</h3>
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
                  {t("new_batch_trader_name")}
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
                  {t("new_batch_trader_phone")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <input type="hidden" name="address" value="Quick add from batch intake" />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold rounded-lg px-4 py-3 mt-4 hover:bg-indigo-700 transition-colors"
              >
                {t("new_batch_btn_save_trader")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Real Barcode Scanner Modal (Loading State) */}
      <div id="barcode-reader-hidden" style={{ display: "none" }}></div>
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm shadow-2xl flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {isRtl ? "جاري تحليل الباركود..." : "Analyzing barcode..."}
            </h3>
            <p className="text-gray-500 text-sm">
              {isRtl ? "لحظات وبيتم قراءة الرقم من الصورة" : "Extracting number from image"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
