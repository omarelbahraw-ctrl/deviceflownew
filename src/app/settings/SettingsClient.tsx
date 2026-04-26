"use client";

import { useState } from "react";
import {
  Key,
  UserPlus,
  Shield,
  Trash2,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { createUser, changePassword, updateUserPermissions, deleteUser } from "./actions";

type UserData = {
  id: string;
  name: string;
  username: string;
  role: string;
  canManageTraders: boolean;
  canManageBatches: boolean;
  canManageDiscount: boolean;
};

export default function SettingsClient({ users }: { users: UserData[] }) {
  const [activeTab, setActiveTab] = useState<"users" | "password" | "add">("users");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Add user
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newRole, setNewRole] = useState("EMPLOYEE");
  const [newCanTraders, setNewCanTraders] = useState(false);
  const [newCanBatches, setNewCanBatches] = useState(true);
  const [newCanDiscount, setNewCanDiscount] = useState(false);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChangePassword = async () => {
    if (!newPassword) return showMsg("error", "أدخل كلمة المرور الجديدة");
    const res = await changePassword(selectedUserId, newPassword);
    if (res.error) return showMsg("error", res.error);
    showMsg("success", "تم تغيير كلمة المرور بنجاح ✅");
    setNewPassword("");
  };

  const handleAddUser = async () => {
    if (!newName || !newUsername || !newUserPassword) {
      return showMsg("error", "جميع الحقول مطلوبة");
    }
    const formData = new FormData();
    formData.set("name", newName);
    formData.set("username", newUsername);
    formData.set("password", newUserPassword);
    formData.set("role", newRole);
    if (newCanTraders) formData.set("canManageTraders", "on");
    if (newCanBatches) formData.set("canManageBatches", "on");
    if (newCanDiscount) formData.set("canManageDiscount", "on");

    const res = await createUser(formData);
    if (res.error) return showMsg("error", res.error);
    showMsg("success", "تم إضافة المستخدم بنجاح ✅");
    setNewName("");
    setNewUsername("");
    setNewUserPassword("");
    window.location.reload();
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    const res = await deleteUser(userId);
    if (res.error) return showMsg("error", res.error);
    showMsg("success", "تم حذف المستخدم");
    window.location.reload();
  };

  const handleTogglePermission = async (
    user: UserData,
    field: "canManageTraders" | "canManageBatches" | "canManageDiscount"
  ) => {
    const updated = { ...user, [field]: !user[field] };
    const res = await updateUserPermissions(user.id, {
      role: updated.role,
      canManageTraders: updated.canManageTraders,
      canManageBatches: updated.canManageBatches,
      canManageDiscount: updated.canManageDiscount,
    });
    if (res.error) return showMsg("error", res.error);
    window.location.reload();
  };

  const handleToggleRole = async (user: UserData) => {
    const newRole = user.role === "ADMIN" ? "EMPLOYEE" : "ADMIN";
    const res = await updateUserPermissions(user.id, {
      role: newRole,
      canManageTraders: newRole === "ADMIN" ? true : user.canManageTraders,
      canManageBatches: newRole === "ADMIN" ? true : user.canManageBatches,
      canManageDiscount: newRole === "ADMIN" ? true : user.canManageDiscount,
    });
    if (res.error) return showMsg("error", res.error);
    window.location.reload();
  };

  const tabs = [
    { id: "users" as const, label: "المستخدمين والصلاحيات", icon: Shield },
    { id: "password" as const, label: "تغيير كلمة المرور", icon: Key },
    { id: "add" as const, label: "إضافة مستخدم", icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-700 bg-indigo-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Users & Permissions */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500">المستخدم</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500">اسم الدخول</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 text-center">الدور</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 text-center">التجار</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 text-center">الأذونات</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 text-center">المخفّض</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {user.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {user.role === "ADMIN" ? "مدير" : "موظف"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(user, "canManageTraders")}
                        className={`h-6 w-11 rounded-full transition-colors relative ${
                          user.canManageTraders ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            user.canManageTraders ? "left-0.5" : "left-[22px]"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(user, "canManageBatches")}
                        className={`h-6 w-11 rounded-full transition-colors relative ${
                          user.canManageBatches ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            user.canManageBatches ? "left-0.5" : "left-[22px]"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(user, "canManageDiscount")}
                        className={`h-6 w-11 rounded-full transition-colors relative ${
                          user.canManageDiscount ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            user.canManageDiscount ? "left-0.5" : "left-[22px]"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Change Password */}
      {activeTab === "password" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-500" />
            تغيير كلمة المرور
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">اختر المستخدم</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              تغيير كلمة المرور
            </button>
          </div>
        </div>
      )}

      {/* Tab: Add User */}
      {activeTab === "add" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-500" />
            إضافة مستخدم جديد
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="مثال: أحمد محمد"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم (للدخول) *</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono"
                placeholder="مثال: ahmed"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور *</label>
              <input
                type="text"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="كلمة المرور"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">الدور</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="EMPLOYEE">موظف</option>
                <option value="ADMIN">مدير</option>
              </select>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الصلاحيات</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={newCanBatches}
                    onChange={(e) => setNewCanBatches(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">إدارة الأذونات والاستلام</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={newCanTraders}
                    onChange={(e) => setNewCanTraders(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">إدارة التجار والعملاء</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={newCanDiscount}
                    onChange={(e) => setNewCanDiscount(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">إدارة المستودع المخفّض</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleAddUser}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              إضافة المستخدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
