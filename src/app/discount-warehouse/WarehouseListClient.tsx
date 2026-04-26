"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, Trash2, Tags, CheckCircle, XCircle } from "lucide-react";
import { deleteDiscountItem, toggleSoldStatus } from "./actions";

type ItemData = {
  id: string;
  brand: string;
  model: string;
  type: string;
  serialNumber: string;
  category: string;
  workingStatus: string;
  previousIssue: string | null;
  readyForSale: boolean;
  priceAfter: number | null;
  image1: string | null;
};

const GRADE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  B: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  C: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

export default function WarehouseListClient({ items }: { items: ItemData[] }) {
  const [filter, setFilter] = useState<"ALL" | "A" | "B" | "C">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = items.filter((item) => {
    if (filter !== "ALL" && item.category !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الجهاز من المستودع؟")) return;
    await deleteDiscountItem(id);
    window.location.reload();
  };

  const handleToggleSold = async (id: string, current: boolean) => {
    await toggleSoldStatus(id, current);
    window.location.reload();
  };

  return (
    <>
      {/* Filter & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(["ALL", "A", "B", "C"] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setFilter(grade)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === grade
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {grade === "ALL" ? "الكل" : `فئة ${grade}`}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 pr-11 pl-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="ابحث بالبراند أو الموديل أو السيريال..."
          />
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-gray-100 shadow-sm">
          <Tags className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            {searchQuery ? "لا توجد نتائج" : "المستودع فارغ"}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? "جرّب كلمة بحث مختلفة" : "أضف أول جهاز للمستودع المخفّض"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const grade = GRADE_STYLES[item.category] || GRADE_STYLES.C;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                  !item.readyForSale ? "opacity-60" : ""
                }`}
              >
                {/* Image */}
                {item.image1 ? (
                  <img
                    src={item.image1}
                    alt={`${item.brand} ${item.model}`}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                    <Tags className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">
                      {item.brand} {item.model}
                    </h3>
                    <span
                      className={`h-8 w-8 rounded-full ${grade.bg} ${grade.text} flex items-center justify-center font-bold text-sm ${grade.border} border`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-1 rounded">{item.serialNumber}</span>
                    </p>
                    {item.type && (
                      <p className="text-xs text-gray-500">النوع: {item.type}</p>
                    )}
                    {item.previousIssue && (
                      <p className="text-xs text-red-600">
                        المشكلة: {item.previousIssue.substring(0, 50)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    {item.priceAfter && (
                      <span className="text-lg font-bold text-green-600">
                        {item.priceAfter.toLocaleString()} ر.س
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleSold(item.id, item.readyForSale)}
                      className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                        item.readyForSale
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.readyForSale ? (
                        <><CheckCircle className="h-3 w-3" /> متاح</>
                      ) : (
                        <><XCircle className="h-3 w-3" /> تم البيع</>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/discount-warehouse/${item.id}`}
                      className="flex-1 text-center py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="h-4 w-4 inline ml-1" /> التفاصيل
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
