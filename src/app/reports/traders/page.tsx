import { prisma } from "@/lib/prisma";
import TraderReportClient from "./TraderReportClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تقرير التجار الشهري - عاصمة المجد",
  description: "عرض وحساب إجمالي أجهزة التجار وتقارير المناديب الشهرية",
};

export default async function TraderReportsPage() {
  let traders: any[] = [];
  let devices: any[] = [];

  try {
    traders = await prisma.trader.findMany({
      orderBy: { name: "asc" },
    });

    devices = await prisma.device.findMany({
      include: {
        batch: {
          select: {
            id: true,
            reportNumber: true,
            representative: true,
            date: true,
          },
        },
        trader: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to query data for trader monthly reports:", error);
  }

  return (
    <div className="space-y-6">
      <TraderReportClient initialTraders={traders} initialDevices={devices} />
    </div>
  );
}
