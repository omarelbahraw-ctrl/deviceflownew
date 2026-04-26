"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Default settings if not present in DB
export const DEFAULT_SETTINGS = {
  DEVICE_TYPES: ["شاشات", "ثلاجات", "غسالات", "مكيفات", "برادات مياه", "مبردات هواء", "مكانس", "أفران", "أخرى"],
  KNOWN_BRANDS: ["سرين", "فريش", "جنرال سرين", "كيولد", "هايكرز", "نيكاي", "كي ام سي", "دانسات", "دبليو بوكس", "سامسونج", "ال جي", "تي سي ال", "أخرى"],
  FAULT_TYPES: ["يعمل (لا يوجد عطل)", "لا يعمل نهائياً", "مكسور", "خط في الشاشة", "دوت (نقطة)", "عطل بانل", "أخرى"],
};

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Map them into a useful object
    const result = {
      DEVICE_TYPES: [...DEFAULT_SETTINGS.DEVICE_TYPES],
      KNOWN_BRANDS: [...DEFAULT_SETTINGS.KNOWN_BRANDS],
      FAULT_TYPES: [...DEFAULT_SETTINGS.FAULT_TYPES],
    };

    settings.forEach((s) => {
      try {
        const parsed = JSON.parse(s.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (s.key === "DEVICE_TYPES") result.DEVICE_TYPES = parsed;
          if (s.key === "KNOWN_BRANDS") result.KNOWN_BRANDS = parsed;
          if (s.key === "FAULT_TYPES") result.FAULT_TYPES = parsed;
        }
      } catch (e) {
        console.error("Failed to parse setting", s.key);
      }
    });

    return result;
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults if DB error (like schema not updated yet)
    return DEFAULT_SETTINGS;
  }
}

export async function updateSystemSetting(key: string, values: string[]) {
  try {
    const jsonValue = JSON.stringify(values);
    
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: jsonValue },
      create: { key, value: jsonValue },
    });

    revalidatePath("/settings");
    revalidatePath("/batches/new");
    revalidatePath("/discount-warehouse/new");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating setting:", error);
    return { error: "حدث خطأ أثناء حفظ الإعدادات" };
  }
}
