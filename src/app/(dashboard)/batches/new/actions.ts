"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
  discountCategory?: string;
};

export async function createBatchWithDevices(
  traderId: string,
  devices: DeviceEntry[],
  reportNumber?: string | null,
  representative?: string | null
) {
  if (!traderId) return { error: "يرجى اختيار العميل" };
  if (devices.length === 0) return { error: "يرجى إضافة بند واحد على الأقل" };

  // Resolve technician name from cookies session
  let sessionName = "الفني المسؤول";
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("deviceflow_session")?.value;
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie);
      if (session.name) {
        sessionName = session.name;
      }
    }
  } catch (e) {
    console.warn("Failed to get technician name from session cookie", e);
  }

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
    const isDiscountWarehouseTrigger = (decision: string) =>
      decision === "ACCEPT" ||
      decision === "RETURNED_COMPLIANT" ||
      decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE";

    // Build devices data array for nested create
    const devicesData = devices.map(device => {
      const decision = (device.inspectionResult === "MATCH" ? "ACCEPT" : "PENDING") as any;
      return {
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
        discountCategory: (device.discountCategory as any) || "B",
        inspectorName: sessionName,
        inspectionDate: new Date(),
      };
    });

    // Single nested write transaction
    const batch = await prisma.batch.create({
      data: {
        traderId,
        status: "CLOSED",
        closedAt: new Date(),
        reportNumber: reportNumber || null,
        representative: representative || null,
        devices: {
          create: devicesData
        }
      },
      include: {
        devices: true
      }
    });

    // Create discount warehouse records separately
    const discountItems = batch.devices
      .filter(d => isDiscountWarehouseTrigger(d.decision))
      .map(d => ({
        deviceId: d.id,
        brand: d.brand,
        model: d.model,
        type: d.type,
        serialNumber: d.serialNumber,
        category: d.discountCategory,
        workingStatus: "WORKING",
        previousIssue: d.notes || "تحويل تلقائي من فحص أجهزة المرتجعات",
        readyForSale: true,
      }));

    if (discountItems.length > 0) {
      await prisma.discountWarehouse.createMany({
        data: discountItems as any
      });
    }

    revalidatePath("/batches");
    return { success: true, batchId: batch.id };
  } catch (error: any) {
    console.error("Error creating batch with devices:", error);
    if (error?.code === "P2002") {
      return { error: "رقم سيريال مكرر! تأكد من عدم تكرار أرقام السيريال." };
    }
    return { error: "حدث خطأ أثناء الحفظ. تأكد من صحة البيانات." };
  }
}
