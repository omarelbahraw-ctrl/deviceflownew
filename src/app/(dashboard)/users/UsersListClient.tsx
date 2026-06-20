"use client";

import { useState } from "react";
import { Search, Edit, Trash2, Shield, User, Plus } from "lucide-react";
import { deleteUser } from "./actions";
import UserFormModal from "./UserFormModal";
import { useTranslation } from "@/components/layout/LanguageContext";

export default function UsersListClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const { t } = useTranslation();

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("users_confirm_delete") || "هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;
    
    const res = await deleteUser(id);
    if (res.success) {
      setUsers(users.filter(u => u.id !== id));
    } else {
      alert(res.error || "Failed to delete user");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pr-11 pl-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            placeholder="ابحث بالاسم أو اسم المستخدم..."
          />
        </div>
        
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" /> {t("users_btn_add")}
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t("users_table_name")}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t("users_table_username")}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t("users_table_role")}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t("users_table_permissions")}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t("users_table_actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>{t("users_empty")}</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'ADMIN' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        {user.role === 'ADMIN' ? t("users_role_admin") : t("users_role_employee")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded border border-purple-100">صلاحيات كاملة</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {user.canManageBatches && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">{t("users_perm_batches")}</span>}
                          {user.canManageTraders && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">{t("users_perm_traders")}</span>}
                          {user.canManageDiscount && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">{t("users_perm_discount")}</span>}
                          {!user.canManageBatches && !user.canManageTraders && !user.canManageDiscount && (
                            <span className="text-xs text-gray-400">بدون صلاحيات</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                          title={t("users_edit_title")}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userToEdit={editingUser}
        onSuccess={() => {
          setIsModalOpen(false);
          window.location.reload(); // Simple refresh to get latest list
        }}
      />
    </>
  );
}
