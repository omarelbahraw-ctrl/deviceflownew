import { prisma } from "@/lib/prisma";
import { Tags, Plus } from "lucide-react";
import Link from "next/link";
import WarehouseListClient from "./WarehouseListClient";

export default async function DiscountWarehousePage() {
  const items = await prisma.discountWarehouse.findMany({
    orderBy: { createdAt: "desc" },
  });

  const itemsData = items.map((item) => ({
    id: item.id,
    brand: item.brand || "",
    model: item.model || "",
    type: item.type || "",
    serialNumber: item.serialNumber || "",
    category: item.category,
    workingStatus: item.workingStatus,
    previousIssue: item.previousIssue,
    readyForSale: item.readyForSale,
    priceAfter: item.priceAfter,
    image1: item.image1,
  }));

  const gradeA = items.filter((i) => i.category === "A").length;
  const gradeB = items.filter((i) => i.category === "B").length;
  const gradeC = items.filter((i) => i.category === "C").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="h-6 w-6 text-amber-600" />
            المستودع المخفّض
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            أجهزة مُعاد إصلاحها وتجهيزها للبيع بأسعار مخفّضة
          </p>
        </div>
        <Link
          href="/discount-warehouse/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" /> إضافة جهاز
        </Link>
      </div>

      {/* Grade Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">فئة A — ممتاز</p>
              <p className="text-2xl font-bold text-green-600">{gradeA}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">A</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">فئة B — جيد</p>
              <p className="text-2xl font-bold text-amber-600">{gradeB}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">B</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">فئة C — اقتصادي</p>
              <p className="text-2xl font-bold text-red-600">{gradeC}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xl">C</div>
          </div>
        </div>
      </div>

      <WarehouseListClient items={itemsData} />
    </div>
  );
}
