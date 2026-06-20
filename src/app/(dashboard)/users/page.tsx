import { Users, Plus } from "lucide-react";
import UsersListClient from "./UsersListClient";
import { getUsers } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const result = await getUsers();
  const users = result.success && result.users ? result.users : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            أضف فنيين أو موظفين وحدد صلاحياتهم للوصول لأقسام النظام
          </p>
        </div>
      </div>

      <UsersListClient initialUsers={users} />
    </div>
  );
}
