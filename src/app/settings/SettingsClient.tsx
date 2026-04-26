"use client";

import { useState } from "react";
import { Plus, X, Save, CheckCircle2, Settings as SettingsIcon } from "lucide-react";
import { updateSystemSetting } from "./actions";

type SettingsProps = {
  DEVICE_TYPES: string[];
  KNOWN_BRANDS: string[];
  FAULT_TYPES: string[];
};

export default function SettingsClient({ initialSettings }: { initialSettings: SettingsProps }) {
  const [deviceTypes, setDeviceTypes] = useState(initialSettings.DEVICE_TYPES);
  const [brands, setBrands] = useState(initialSettings.KNOWN_BRANDS);
  const [faultTypes, setFaultTypes] = useState(initialSettings.FAULT_TYPES);

  const [newDeviceType, setNewDeviceType] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newFaultType, setNewFaultType] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleAddItem = (
    value: string,
    setValue: (val: string) => void,
    list: string[],
    setList: (val: string[]) => void
  ) => {
    if (!value.trim()) return;
    if (list.includes(value.trim())) {
      setValue("");
      return; // Already exists
    }
    setList([...list, value.trim()]);
    setValue("");
  };

  const handleRemoveItem = (index: number, list: string[], setList: (val: string[]) => void) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage("");

    await Promise.all([
      updateSystemSetting("DEVICE_TYPES", deviceTypes),
      updateSystemSetting("KNOWN_BRANDS", brands),
      updateSystemSetting("FAULT_TYPES", faultTypes),
    ]);

    setIsSaving(false);
    setSaveMessage("تم حفظ الإعدادات بنجاح!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const renderSection = (
    title: string,
    list: string[],
    setList: (val: string[]) => void,
    inputValue: string,
    setInputValue: (val: string) => void,
    placeholder: string
  ) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
            <span>{item}</span>
            <button
              onClick={() => handleRemoveItem(idx, list, setList)}
              className="text-indigo-400 hover:text-red-500 hover:bg-white rounded-full p-0.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem(inputValue, setInputValue, list, setList);
            }
          }}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder}
        />
        <button
          onClick={() => handleAddItem(inputValue, setInputValue, list, setList)}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {saveMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200 font-bold">
          <CheckCircle2 className="h-6 w-6" />
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection(
          "أنواع الأجهزة",
          deviceTypes,
          setDeviceTypes,
          newDeviceType,
          setNewDeviceType,
          "إضافة نوع جديد (مثال: أفران)..."
        )}

        {renderSection(
          "قائمة البراندات المقترحة",
          brands,
          setBrands,
          newBrand,
          setNewBrand,
          "إضافة براند جديد (مثال: سوني)..."
        )}

        <div className="md:col-span-2">
          {renderSection(
            "أنواع الأعطال (القرارات الفنية)",
            faultTypes,
            setFaultTypes,
            newFaultType,
            setNewFaultType,
            "إضافة نوع عطل جديد..."
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
        >
          {isSaving ? "جاري الحفظ..." : <><Save className="h-5 w-5" /> حفظ جميع التعديلات</>}
        </button>
      </div>
    </div>
  );
}
