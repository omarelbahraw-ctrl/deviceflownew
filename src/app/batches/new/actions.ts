"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type DeviceEntry = {
  id: string; // client-side temp ID
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  inspectionResult: string;
  faultType: string;
  accessoriesStatus: string;
  notes: string;
  imageBase64: string | null;
};

export async function createBatchWithDevices(
  traderId: string,
  devices: DeviceEntry[]
) {
  if (!traderId) return { error: "يرجى اختيار العميل" };
  if (devices.length === 0) return { error: "يرجى إضافة بند واحد على الأقل" };

  // Validate trader exists
  const trader = await prisma.trader.findUnique({ where: { id: traderId } });
  if (!trader) {
    // Try by name
    const traderByName = await prisma.trader.findFirst({ where: { name: traderId } });
    if (!traderByName) return { error: "لم يتم العثور على العميل" };
    traderId = traderByName.id;
  }

  // Check for duplicate serial numbers
  const serials = devices.map((d) => d.serialNumber);
  const duplicates = await prisma.device.findMany({
    where: { serialNumber: { in: serials } },
    select: { serialNumber: true },
  });
  if (duplicates.length > 0) {
    return {
      error: `أرقام السيريال التالية مسجلة بالفعل: ${duplicates.map((d) => d.serialNumber).join(", ")}`,
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the batch
      const batch = await tx.batch.create({
        data: {
          traderId,
          status: "CLOSED",
          closedAt: new Date(),
        },
      });

      // Create all devices
      for (const device of devices) {
        const decision = device.inspectionResult === "MATCH" ? "ACCEPT" : "PENDING";
        await tx.device.create({
          data: {
            batchId: batch.id,
            traderId,
            brand: device.brand,
            type: device.deviceType,
            model: device.model,
            serialNumber: device.serialNumber,
            condition: "USED",
            cartonStatus: "NONE",
            accessoriesStatus: device.accessoriesStatus || "كامل ملحقاته",
            inspectionResult: device.inspectionResult as any,
            faultType: device.faultType || null,
            notes: device.notes || null,
            imageBase64: device.imageBase64 || null,
            decision,
            inspectorName: "المفتش الحالي",
            inspectionDate: new Date(),
          },
        });
      }

      return batch;
    });

    revalidatePath("/batches");
    return { success: true, batchId: result.id };
  } catch (error: any) {
    console.error("Error creating batch with devices:", error);
    if (error?.code === "P2002") {
      return { error: "رقم سيريال مكرر! تأكد من عدم تكرار أرقام السيريال." };
    }
    return { error: "حدث خطأ أثناء الحفظ. تأكد من صحة البيانات." };
  }
}
