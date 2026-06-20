"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Phone,
  User,
  UserCheck,
  Eye,
  Trash2,
  Package,
  Hash,
  Users,
} from "lucide-react";
import { deleteTrader } from "./actions";

type TraderData = {
  id: string;
  name: string;
  phone: string;
  contactPerson: string | null;
  representative: string | null;
  batchCount: number;
  deviceCount: number;
};

export default function TradersListClient({
  traders,
}: {
  traders: TraderData[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTraders = traders.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.contactPerson?.toLowerCase().includes(q) ||
      t.representative?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟ سيتم حذف جميع البيانات المرتبطة.`)) return;
    await deleteTrader(id);
    window.location.reload();
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي التجار</p>
              <p className="text-xl font-bold text-gray-900">{traders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الأذونات</p>
              <p className="text-xl font-bold text-blue-600">
                {traders.reduce((sum, t) => sum + t.batchCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hidden sm:block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Hash className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الأجهزة</p>
              <p className="text-xl font-bold text-green-600">
                {traders.reduce((sum, t) => sum + t.deviceCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pr-11 pl-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
          />
        </div>
      </div>

      {/* Traders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            قائمة التجار
          </h2>
          <span className="text-sm text-gray-500">
            {searchQuery ? `${filteredTraders.length} نتيجة` : `${traders.length} تاجر`}
          </span>
        </div>

        {filteredTraders.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {searchQuery ? "لا توجد نتائج" : "لا يوجد تجار بعد"}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery
                ? "جرّب البحث بكلمة مختلفة"
                : "قم بإضافة أول تاجر لبدء العمل"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredTraders.map((trader) => (
              <div
                key={trader.id}
                className="px-6 py-4 hover:bg-indigo-50/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Trader Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/traders/${trader.id}`}
                        className="text-base font-bold text-gray-900 hover:text-indigo-700 transition-colors"
                      >
                        {trader.name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3.5 w-3.5" />
                          <span dir="ltr">{trader.phone}</span>
                        </span>
                        {trader.contactPerson && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            <User className="h-3 w-3" /> {trader.contactPerson}
                          </span>
                        )}
                        {trader.representative && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            <UserCheck className="h-3 w-3" /> {trader.representative}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="text-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <span className="block text-xs text-blue-500">أذونات</span>
                        <span className="block text-sm font-bold text-blue-700">
                          {trader.batchCount}
                        </span>
                      </div>
                      <div className="text-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        <span className="block text-xs text-indigo-500">أجهزة</span>
                        <span className="block text-sm font-bold text-indigo-700">
                          {trader.deviceCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
                      <Link
                        href={`/traders/${trader.id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="عرض الملف"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">الملف</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(trader.id, trader.name)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="حذف التاجر"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
