"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDiscountItem(data: {
  brand: string;
  model: string;
  type: string;
  serialNumber: string;
  category: string;
  workingStatus: string;
  previousIssue: string;
  repairDone: string;
  accessories: string;
  displayNotes: string;
  priceBefore: number | null;
  priceAfter: number | null;
  repairCost: number | null;
  image1: string | null;
  image2: string | null;
  image3: string | null;
}) {
  if (!data.brand || !data.serialNumber) {
    return { error: "البراند ورقم السيريال مطلوبان" };
  }

  try {
    const item = await prisma.discountWarehouse.create({
      data: {
        brand: data.brand,
        model: data.model,
        type: data.type,
        serialNumber: data.serialNumber,
        category: data.category as any,
        workingStatus: data.workingStatus as any,
        previousIssue: data.previousIssue || null,
        repairDone: data.repairDone || null,
        accessories: data.accessories || null,
        displayNotes: data.displayNotes || null,
        priceBefore: data.priceBefore,
        priceAfter: data.priceAfter,
        repairCost: data.repairCost,
        image1: data.image1,
        image2: data.image2,
        image3: data.image3,
        readyForSale: true,
      },
    });

    revalidatePath("/discount-warehouse");
    return { success: true, id: item.id };
  } catch (error) {
    console.error("Error creating discount item:", error);
    return { error: "حدث خطأ أثناء الإضافة" };
  }
}

export async function deleteDiscountItem(id: string) {
  try {
    await prisma.discountWarehouse.delete({ where: { id } });
    revalidatePath("/discount-warehouse");
    return { success: true };
  } catch (error) {
    console.error("Error deleting discount item:", error);
    return { error: "حدث خطأ أثناء الحذف" };
  }
}

export async function toggleSoldStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.discountWarehouse.update({
      where: { id },
      data: { readyForSale: !currentStatus },
    });
    revalidatePath("/discount-warehouse");
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ" };
  }
}
