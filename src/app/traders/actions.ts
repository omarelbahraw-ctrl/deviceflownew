"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTrader(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const representative = formData.get("representative") as string;
  const email = formData.get("email") as string;

  if (!name || !phone) {
    return { error: "اسم المؤسسة ورقم الهاتف مطلوبان" };
  }

  try {
    await prisma.trader.create({
      data: {
        name,
        phone,
        contactPerson: contactPerson || null,
        representative: representative || null,
        email: email || null,
      },
    });

    revalidatePath("/traders");
    return { success: true };
  } catch (error) {
    console.error("Error creating trader:", error);
    return { error: "حدث خطأ أثناء إضافة التاجر" };
  }
}

export async function deleteTrader(id: string) {
  try {
    await prisma.trader.delete({
      where: { id },
    });
    revalidatePath("/traders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting trader:", error);
    return { error: "حدث خطأ أثناء حذف التاجر، ربما يكون مرتبطاً بأجهزة مسجلة" };
  }
}
