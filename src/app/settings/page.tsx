import { prisma } from "@/lib/prisma";
import { Settings } from "lucide-react";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      canManageTraders: true,
      canManageBatches: true,
      canManageDiscount: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          الإعدادات
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          إدارة المستخدمين وكلمات المرور والصلاحيات
        </p>
      </div>

      <SettingsClient users={users} />
    </div>
  );
}
