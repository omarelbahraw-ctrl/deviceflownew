"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// إضافة مستخدم جديد
export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const canManageTraders = formData.get("canManageTraders") === "on";
  const canManageBatches = formData.get("canManageBatches") === "on";
  const canManageDiscount = formData.get("canManageDiscount") === "on";

  if (!name || !username || !password) {
    return { error: "جميع الحقول الأساسية مطلوبة" };
  }

  // Check username uniqueness
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "اسم المستخدم مستخدم بالفعل" };
  }

  try {
    await prisma.user.create({
      data: {
        name,
        username,
        password,
        role: role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
        canManageTraders,
        canManageBatches,
        canManageDiscount,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "حدث خطأ أثناء إنشاء المستخدم" };
  }
}

// تغيير كلمة المرور
export async function changePassword(userId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 4) {
    return { error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: "حدث خطأ أثناء تغيير كلمة المرور" };
  }
}

// تحديث صلاحيات مستخدم
export async function updateUserPermissions(
  userId: string,
  permissions: {
    role: string;
    canManageTraders: boolean;
    canManageBatches: boolean;
    canManageDiscount: boolean;
  }
) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: permissions.role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
        canManageTraders: permissions.canManageTraders,
        canManageBatches: permissions.canManageBatches,
        canManageDiscount: permissions.canManageDiscount,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating permissions:", error);
    return { error: "حدث خطأ أثناء تحديث الصلاحيات" };
  }
}

// حذف مستخدم
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "حدث خطأ أثناء حذف المستخدم" };
  }
}
