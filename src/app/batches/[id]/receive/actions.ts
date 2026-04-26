"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function receiveDevice(formData: FormData) {
  const batchId = formData.get("batchId") as string;
  const traderId = formData.get("traderId") as string;
  const batchItemId = formData.get("batchItemId") as string; // Required to link to expected item
  
  const serialNumber = formData.get("serialNumber") as string;
  const condition = formData.get("condition") as any;
  const cartonStatus = formData.get("cartonStatus") as any;
  const accessoriesStatus = formData.get("accessoriesStatus") as string;
  
  const inspectionResult = formData.get("inspectionResult") as any;
  const faultType = formData.get("faultType") as string;
  const defectType = formData.get("defectType") as string;
  const notes = formData.get("notes") as string;

  let type = formData.get("deviceType") as string;
  let brand = formData.get("brand") as string;
  let model = formData.get("model") as string;
  
  if (!batchId || !serialNumber) {
    return { error: "يرجى تعبئة الحقول الأساسية (السيريال)" };
  }

  // Fetch the batch item to get brand, type, and model if not DIRECT
  if (batchItemId !== "DIRECT") {
    const batchItem = await prisma.batchItem.findUnique({
      where: { id: batchItemId }
    });

    if (!batchItem) {
      return { error: "الصنف المختار غير موجود" };
    }
    type = batchItem.deviceType;
    brand = batchItem.brand;
    model = batchItem.model;
  }

  try {
    // Check if serial number already exists globally
    const existingDevice = await prisma.device.findUnique({
      where: { serialNumber }
    });

    if (existingDevice) {
      return { error: "رقم السيريال مسجل بالفعل لجهاز آخر في النظام!" };
    }

    // Determine decision based on inspection result
    let decision: any = "PENDING";
    if (inspectionResult === "MATCH") {
      decision = "ACCEPT";
    } else if (inspectionResult === "NOT_MATCH") {
      decision = "PENDING"; // Can be decided later by supervisor (Return vs Discount)
    }

    await prisma.device.create({
      data: {
        batchId,
        traderId,
        brand: brand,
        type: type,
        model: model,
        serialNumber,
        condition,
        cartonStatus,
        accessoriesStatus,
        inspectionResult,
        faultType,
        defectType,
        notes,
        decision,
        inspectorName: "المفتش الحالي", // In a real app, this comes from auth session
        inspectionDate: new Date(),
      },
    });

    revalidatePath(`/batches/${batchId}/receive`);
    revalidatePath(`/batches/${batchId}`);
    return { success: true };
  } catch (error) {
    console.error("Error receiving device:", error);
    return { error: "حدث خطأ أثناء حفظ بيانات الجهاز. تأكد من صحة البيانات." };
  }
}
