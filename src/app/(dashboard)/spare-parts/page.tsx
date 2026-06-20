import { prisma } from "@/lib/prisma";
import SparePartsClient from "./SparePartsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "مستودع قطع الغيار المركزية - عاصمة المجد",
  description: "إدارة مخزون قطع الغيار وحركات الإدخال والصرف وسجل العمليات",
};

export default async function SparePartsPage() {
  let parts: any[] = [];
  let transactions: any[] = [];

  try {
    parts = await prisma.sparePart.findMany({
      orderBy: { name: "asc" },
    });

    transactions = await prisma.partTransaction.findMany({
      include: {
        part: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: 100, // Show last 100 logs
    });
  } catch (error) {
    console.error("Failed to query data for spare parts dashboard:", error);
  }

  return (
    <div className="space-y-6">
      <SparePartsClient initialParts={parts} initialTransactions={transactions} />
    </div>
  );
}
