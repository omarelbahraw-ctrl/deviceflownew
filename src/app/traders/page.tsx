import { prisma } from "@/lib/prisma";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import TradersListClient from "./TradersListClient";

export default async function TradersPage() {
  let traders: any[] = [];
  try {
    traders = await prisma.trader.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { batches: true, devices: true },
        },
      },
    });
  } catch (error) {
    console.warn("Database connection failed. Using mock traders for preview.", error);
  }

  const tradersData = traders.map((t) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    contactPerson: t.contactPerson,
    representative: t.representative,
    batchCount: t._count.batches,
    deviceCount: t._count.devices,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            التجار والعملاء
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة بيانات التجار والبحث عن عميل
          </p>
        </div>
        <Link
          href="/traders/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" /> إضافة تاجر جديد
        </Link>
      </div>

      {/* Client-side searchable list */}
      <TradersListClient traders={tradersData} />
    </div>
  );
}
