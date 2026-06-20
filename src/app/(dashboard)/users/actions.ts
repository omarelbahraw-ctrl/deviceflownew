"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        canManageTraders: true,
        canManageBatches: true,
        canManageDiscount: true,
        createdAt: true,
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "حدث خطأ أثناء جلب المستخدمين" };
  }
}

export async function createUser(data: any) {
  try {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      return { success: false, error: "اسم المستخدم مسجل مسبقاً" };
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: data.password, // In a real app, hash the password
        role: data.role as Role,
        canManageTraders: data.canManageTraders,
        canManageBatches: data.canManageBatches,
        canManageDiscount: data.canManageDiscount,
      },
    });
    
    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "حدث خطأ أثناء إنشاء المستخدم" };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    // Check if updating username to one that already exists
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { 
          username: data.username,
          NOT: { id: id }
        },
      });

      if (existing) {
        return { success: false, error: "اسم المستخدم مسجل لمستخدم آخر" };
      }
    }

    const updateData: any = {
      name: data.name,
      username: data.username,
      role: data.role as Role,
      canManageTraders: data.canManageTraders,
      canManageBatches: data.canManageBatches,
      canManageDiscount: data.canManageDiscount,
    };

    if (data.password && data.password.trim() !== "") {
      updateData.password = data.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    revalidatePath("/users");
    return { success: true, user };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث بيانات المستخدم" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المستخدم" };
  }
}
