"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { createUser, updateUser } from "./actions";
import { useTranslation } from "@/components/layout/LanguageContext";

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: any | null;
  onSuccess: () => void;
};

export default function UserFormModal({ isOpen, onClose, userToEdit, onSuccess }: UserFormModalProps) {
  const { t, isRtl } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "EMPLOYEE",
    canManageTraders: false,
    canManageBatches: false,
    canManageDiscount: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        username: userToEdit.username,
        password: "", // empty for edit
        role: userToEdit.role,
        canManageTraders: userToEdit.canManageTraders,
        canManageBatches: userToEdit.canManageBatches,
        canManageDiscount: userToEdit.canManageDiscount,
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "EMPLOYEE",
        canManageTraders: false,
        canManageBatches: true, // Default permission for technicians
        canManageDiscount: false,
      });
    }
    setError("");
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name.trim() || !formData.username.trim() || (!userToEdit && !formData.password.trim())) {
      setError("الرجاء تعبئة جميع الحقول الإلزامية");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = userToEdit 
        ? await updateUser(userToEdit.id, formData)
        : await createUser(formData);

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "حدث خطأ غير متوقع");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {userToEdit ? t("users_edit_title") : t("users_add_title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t("users_field_name")}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="مثال: أحمد محمد"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t("users_field_username")}</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="ahmed123"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {userToEdit ? t("users_field_password_edit") : t("users_field_password")}
              </label>
              <input
                type="password"
                required={!userToEdit}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t("users_field_role")}</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold"
              >
                <option value="EMPLOYEE">{t("users_role_employee")}</option>
                <option value="ADMIN">{t("users_role_admin")}</option>
              </select>
            </div>

            {formData.role === "EMPLOYEE" && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">{t("users_section_permissions")}</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canManageBatches}
                      onChange={(e) => setFormData({ ...formData, canManageBatches: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm font-bold text-gray-800">{t("users_perm_batches")}</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canManageTraders}
                      onChange={(e) => setFormData({ ...formData, canManageTraders: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm font-bold text-gray-800">{t("users_perm_traders")}</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canManageDiscount}
                      onChange={(e) => setFormData({ ...formData, canManageDiscount: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm font-bold text-gray-800">{t("users_perm_discount")}</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "جاري الحفظ..." : t("users_btn_save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
