import { getSystemSettings } from "./actions";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSystemSettings();

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
        <p className="text-gray-500 mt-1">تعديل القوائم المنسدلة للبراندات وأنواع الأجهزة وغيرها</p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
