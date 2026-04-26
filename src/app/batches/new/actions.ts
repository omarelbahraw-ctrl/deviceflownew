"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBatchAndReceiveDevice(formData: FormData) {
  const traderIdOrName = formData.get("traderIdOrName") as string;
  const serialNumber = formData.get("serialNumber") as string;
  const type = formData.get("deviceType") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  
  const condition = formData.get("condition") as any || "USED";
  const cartonStatus = "NONE"; // Default
  const accessoriesStatus = formData.get("accessoriesStatus") as string;
  
  const inspectionResult = formData.get("inspectionResult") as any;
  const faultType = formData.get("faultType") as string;
  const defectType = ""; // Removed from simple form
  const notes = ""; // Removed from simple form
  
  if (!traderIdOrName || !serialNumber || !type || !brand) {
    return { error: "يرجى تعبئة الحقول الأساسية (العميل، السيريال، النوع، البراند)" };
  }

  try {
    // 1. Resolve Trader ID
    let finalTraderId = traderIdOrName;
    
    // If it's a name instead of ID (happens with optimistic temp additions)
    const existingTrader = await prisma.trader.findFirst({
      where: { 
        OR: [
          { id: traderIdOrName },
          { name: traderIdOrName }
        ]
      }
    });

    if (!existingTrader) {
      return { error: "لم يتم العثور على العميل في قاعدة البيانات." };
    }
    
    finalTraderId = existingTrader.id;

    // 2. Check if serial number already exists globally
    const existingDevice = await prisma.device.findUnique({
      where: { serialNumber }
    });

    if (existingDevice) {
      return { error: "رقم السيريال مسجل بالفعل لجهاز آخر في النظام!" };
    }

    // 3. Create Batch and Device in one transaction
    const decision = inspectionResult === "MATCH" ? "ACCEPT" : "PENDING";
    
    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: {
          traderId: finalTraderId,
        }
      });

      const device = await tx.device.create({
        data: {
          batchId: batch.id,
          traderId: finalTraderId,
          brand,
          type,
          model,
          serialNumber,
          condition,
          cartonStatus,
          accessoriesStatus,
          inspectionResult,
          faultType,
          defectType,
          notes,
          decision,
          inspectorName: "المفتش الحالي",
          inspectionDate: new Date(),
        }
      });

      return { batch, device };
    });

    revalidatePath(`/batches`);
    return { success: true, batchId: result.batch.id };
    
  } catch (error) {
    console.error("Error in fast unified batch creation:", error);
    return { error: "حدث خطأ أثناء حفظ الإذن والجهاز. تأكد من صحة البيانات." };
  }
}
