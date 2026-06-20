"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Create a new spare part in stock
export async function createSparePart(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const compatibleModels = formData.get("compatibleModels") as string;
  const quantityStr = formData.get("quantity") as string;
  const minQuantityStr = formData.get("minQuantity") as string;
  const priceStr = formData.get("price") as string;

  if (!name || !code || !compatibleModels || !quantityStr) {
    return { error: "يرجى تعبئة الحقول المطلوبة (الاسم، الكود، الموديلات، والكمية)" };
  }

  const quantity = parseInt(quantityStr);
  const minQuantity = minQuantityStr ? parseInt(minQuantityStr) : 5;
  const price = priceStr ? parseFloat(priceStr) : null;

  try {
    // Check code uniqueness
    const existing = await prisma.sparePart.findUnique({
      where: { code },
    });

    if (existing) {
      return { error: "كود قطعة الغيار هذا مسجل بالفعل لقطعة أخرى!" };
    }

    await prisma.sparePart.create({
      data: {
        name,
        code,
        compatibleModels,
        quantity,
        minQuantity,
        price,
      },
    });

    revalidatePath("/spare-parts");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating spare part:", error);
    return { error: error.message || "حدث خطأ أثناء إضافة قطعة الغيار" };
  }
}

// 2. Update spare part details
export async function updateSparePart(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const compatibleModels = formData.get("compatibleModels") as string;
  const minQuantityStr = formData.get("minQuantity") as string;
  const priceStr = formData.get("price") as string;

  if (!name || !compatibleModels) {
    return { error: "يرجى تعبئة الحقول المطلوبة" };
  }

  const minQuantity = minQuantityStr ? parseInt(minQuantityStr) : 5;
  const price = priceStr ? parseFloat(priceStr) : null;

  try {
    await prisma.sparePart.update({
      where: { id },
      data: {
        name,
        compatibleModels,
        minQuantity,
        price,
      },
    });

    revalidatePath("/spare-parts");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating spare part:", error);
    return { error: "حدث خطأ أثناء تعديل بيانات قطعة الغيار" };
  }
}

// 3. Delete a spare part
export async function deleteSparePart(id: string) {
  try {
    await prisma.sparePart.delete({
      where: { id },
    });
    revalidatePath("/spare-parts");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting spare part:", error);
    return { error: "حدث خطأ أثناء حذف قطعة الغيار من النظام" };
  }
}

// 4. Register a stock transaction (IN or OUT) and update part quantity
export async function addPartTransaction(
  partId: string,
  type: "IN" | "OUT",
  quantity: number,
  recipient: string,
  reference: string,
  notes: string
) {
  if (!partId || !type || !quantity || quantity <= 0) {
    return { error: "يرجى تحديد قطعة الغيار ونوع الحركة والكمية الصحيحة" };
  }

  try {
    const res = await prisma.$transaction(async (tx) => {
      // Find the part first to check current quantity
      const part = await tx.sparePart.findUnique({
        where: { id: partId },
      });

      if (!part) {
        throw new Error("قطعة الغيار غير موجودة بالنظام!");
      }

      // Check if OUT transaction has enough quantity in stock
      if (type === "OUT" && part.quantity < quantity) {
        throw new Error(`الكمية غير كافية بالرصيد! المتوفر حالياً: ${part.quantity} وحدة.`);
      }

      // Create the transaction record
      const transaction = await tx.partTransaction.create({
        data: {
          partId,
          type,
          quantity,
          recipient,
          reference,
          notes,
        },
      });

      // Update the spare part quantity level
      await tx.sparePart.update({
        where: { id: partId },
        data: {
          quantity: type === "IN" 
            ? { increment: quantity } 
            : { decrement: quantity },
        },
      });

      return transaction;
    });

    revalidatePath("/spare-parts");
    return { success: true, transactionId: res.id };
  } catch (error: any) {
    console.error("Error registering stock transaction:", error);
    return { error: error.message || "حدث خطأ أثناء إجراء الحركة المخزنية" };
  }
}
