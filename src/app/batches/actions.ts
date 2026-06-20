"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. إنشاء إذن جديد
export async function createBatch(formData: FormData) {
  const traderId = formData.get("traderId") as string;

  if (!traderId) {
    return { error: "يرجى اختيار التاجر أولاً" };
  }

  try {
    await prisma.batch.create({
      data: {
        traderId,
      },
    });

    revalidatePath("/batches");
    revalidatePath(`/traders/${traderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating batch:", error);
    return { error: "حدث خطأ أثناء إنشاء إذن الاستلام" };
  }
}

// 2. حذف إذن (مع جميع الأجهزة المرتبطة)
export async function deleteBatch(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // حذف الأجهزة المرتبطة أولاً
      await tx.device.deleteMany({ where: { batchId: id } });
      // حذف بنود الإذن المتوقعة
      await tx.batchItem.deleteMany({ where: { batchId: id } });
      // حذف الإذن نفسه
      await tx.batch.delete({ where: { id } });
    });
    revalidatePath("/batches");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting batch:", error);
    return { error: "حدث خطأ أثناء حذف الإذن" };
  }
}

// 3. إضافة صنف متوقع للإذن
export async function addBatchItem(formData: FormData) {
  const batchId = formData.get("batchId") as string;
  const brand = formData.get("brand") as string;
  const deviceType = formData.get("deviceType") as string;
  const model = formData.get("model") as string;
  const expectedQuantityStr = formData.get("expectedQuantity") as string;
  
  if (!batchId || !brand || !deviceType || !model || !expectedQuantityStr) {
    return { error: "يرجى تعبئة جميع الحقول المطلوبة" };
  }

  const expectedQuantity = parseInt(expectedQuantityStr);

  try {
    await prisma.batchItem.create({
      data: {
        batchId,
        brand,
        deviceType,
        model,
        expectedQuantity,
      },
    });

    revalidatePath(`/batches/${batchId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding batch item:", error);
    return { error: "حدث خطأ أثناء إضافة الصنف للإذن" };
  }
}

// 4. حذف صنف متوقع من الإذن
export async function deleteBatchItem(id: string, batchId: string) {
  try {
    await prisma.batchItem.delete({
      where: { id },
    });
    revalidatePath(`/batches/${batchId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting batch item:", error);
    return { error: "حدث خطأ أثناء حذف الصنف" };
  }
}

// 5. إغلاق / حفظ الإذن (يصبح نهائي للقراءة فقط)
export async function closeBatch(batchId: string) {
  try {
    await prisma.batch.update({
      where: { id: batchId },
      data: { status: "CLOSED" },
    });
    revalidatePath(`/batches/${batchId}`);
    revalidatePath('/batches');
    revalidatePath('/'); // Refresh dashboard
    return { success: true };
  } catch (error) {
    console.error("Error closing batch:", error);
    return { error: "حدث خطأ أثناء حفظ وإغلاق الإذن" };
  }
}

// 6. تحديث قرار أو حالة الجهاز الفنية
export async function updateDeviceDecision(deviceId: string, decision: any, batchId: string) {
  try {
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: { decision },
    });

    // Check if the decision is one of the discount warehouse triggers
    const triggerDiscount = 
      decision === "ACCEPT" ||
      decision === "RETURNED_COMPLIANT" || 
      decision === "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE";

    if (triggerDiscount) {
      // Check if already exists in DiscountWarehouse
      const existingDiscount = await prisma.discountWarehouse.findUnique({
        where: { deviceId }
      });

      if (!existingDiscount) {
        // Create a new record in DiscountWarehouse copying fields from the device
        await prisma.discountWarehouse.create({
          data: {
            deviceId,
            brand: updatedDevice.brand,
            model: updatedDevice.model,
            type: updatedDevice.type,
            serialNumber: updatedDevice.serialNumber,
            category: updatedDevice.discountCategory, // Sync category
            workingStatus: "WORKING", // Default status WORKING
            previousIssue: updatedDevice.notes || updatedDevice.defectType || "تحويل تلقائي من فحص أجهزة المرتجعات",
            readyForSale: true,
          }
        });
      }
    } else {
      // If decision changed to something else, remove from discount warehouse
      await prisma.discountWarehouse.deleteMany({
        where: { deviceId }
      });
    }
    
    revalidatePath(`/batches/${batchId}`);
    revalidatePath(`/batches/${batchId}/receive`);
    revalidatePath('/discount-warehouse');
    revalidatePath('/'); // Refresh dashboard
    return { success: true };
  } catch (error) {
    console.error("Error updating device decision:", error);
    return { error: "حدث خطأ أثناء تحديث حالة الجهاز وتزامن المستودع" };
  }
}
