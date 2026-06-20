import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تقارير الحالات - عاصمة المجد",
  description: "تقارير منفصلة للأجهزة لدى الورشة، غير المطابقة والمرفوضة، والجاهزة للتسليم",
};

export default async function ReportsPage() {
  let devices: any[] = [];
  try {
    devices = await prisma.device.findMany({
      orderBy: { updatedAt: "desc" },
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
            name: true,
            phone: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch devices for reports page:", error);
  }

  return (
    <div className="space-y-6">
      <ReportsClient initialDevices={devices} />
    </div>
  );
}
