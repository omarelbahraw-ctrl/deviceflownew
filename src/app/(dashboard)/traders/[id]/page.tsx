import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Package,
  ArrowRight,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Hash,
} from "lucide-react";
import Link from "next/link";

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const trader = await prisma.trader.findUnique({
    where: { id: resolvedParams.id },
    include: {
      batches: {
        orderBy: { date: "desc" },
        include: {
          _count: { select: { devices: true } },
        },
      },
      _count: {
        select: { devices: true, batches: true },
      },
    },
  });

  if (!trader) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/traders"
          className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-indigo-50 text-gray-600 transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-600" />
            ملف التاجر
          </h1>
        </div>
      </div>

      {/* Trader Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-indigo-600 to-indigo-700 h-20"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8">
            <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 flex items-center justify-center h-16 w-16">
              <User className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="flex gap-2 mt-10">
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100">
                <Package className="h-4 w-4" />
                {trader._count.batches} إذن
              </span>
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100">
                <Hash className="h-4 w-4" />
                {trader._count.devices} جهاز
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-4">{trader.name}</h2>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">رقم الهاتف</p>
                <p className="font-bold text-gray-900" dir="ltr">{trader.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">المسئول</p>
                <p className="font-bold text-gray-900">{trader.contactPerson || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <UserCheck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">المندوب</p>
                <p className="font-bold text-gray-900">{trader.representative || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">تاريخ الإضافة</p>
                <p className="font-bold text-gray-900">
                  {new Date(trader.createdAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
            {trader.email && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 col-span-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="font-bold text-gray-900">{trader.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            الأذونات المسجلة ({trader.batches.length})
          </h2>
        </div>

        {trader.batches.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700 mb-1">لا توجد أذونات</p>
            <p className="text-sm">لم يتم تسجيل أي إذن استلام لهذا التاجر بعد.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {trader.batches.map((batch) => (
              <Link
                key={batch.id}
                href={`/batches/${batch.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700 font-mono text-sm">
                        إذن: {batch.id.substring(batch.id.length - 6).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          batch.status === "CLOSED"
                            ? "bg-green-100 text-green-700"
                            : batch.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {batch.status === "CLOSED" ? (
                          <><CheckCircle className="h-3 w-3 inline ml-1" />مكتمل</>
                        ) : batch.status === "IN_PROGRESS" ? (
                          <><Clock className="h-3 w-3 inline ml-1" />قيد الفحص</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 inline ml-1" />جديد</>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(batch.date).toLocaleDateString("ar-SA")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {batch._count.devices} جهاز
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 group-hover:text-indigo-600 transition-colors">
                  <span className="text-sm hidden sm:inline">عرض التفاصيل</span>
                  <Eye className="h-5 w-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Back */}
      <div className="text-center">
        <Link
          href="/traders"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لقائمة التجار
        </Link>
      </div>
    </div>
  );
}
