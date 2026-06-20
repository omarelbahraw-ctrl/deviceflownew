"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function generateDemoDevices() {
  try {
    // 1. Resolve technician name from session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("deviceflow_session");
    const inspectorName = sessionCookie?.value || "فني فحص النظام";

    // 2. Find or create a demo trader
    let trader = await prisma.trader.findFirst({
      where: { name: "تاجر افتراضي للتجارب" },
    });

    if (!trader) {
      trader = await prisma.trader.create({
        data: {
          name: "تاجر افتراضي للتجارب",
          phone: "0501234567",
          contactPerson: "أبو أحمد",
          representative: "مندوب الصيانة والتجارب",
          email: "trader-demo@deviceflow.com",
        },
      });
    }

    // 3. Create a new demo batch
    const reportNum = `SS-${Math.floor(1000 + Math.random() * 9000)}`;
    const batch = await prisma.batch.create({
      data: {
        traderId: trader.id,
        reportNumber: reportNum,
        representative: "مندوب الصيانة والتجارب",
        status: "OPEN",
      },
    });

    // 4. Create the three key report devices (Workshop, Non-compliant Rejected, Ready for Delivery)
    
    // Device 1: IN_WORKSHOP (🔧 لدى الورشة)
    await prisma.device.create({
      data: {
        batchId: batch.id,
        traderId: trader.id,
        brand: "شاشة إل جي LG",
        type: "شاشات",
        model: "LG-OLED-55C3",
        serialNumber: `SN-LG-${Math.floor(100000 + Math.random() * 900000)}`,
        condition: "USED",
        cartonStatus: "DAMAGED",
        accessoriesStatus: "كامل ملحقاته",
        inspectionResult: "NOT_MATCH",
        faultType: "تالف / لا يعمل",
        defectType: "كسر بالبنل الداخلي مع خطوط رأسية",
        decision: "IN_WORKSHOP",
        inspectorName,
        inspectionDate: new Date(),
        notes: "تم تحويل الجهاز إلى قسم الصيانة والورشة لإجراء فحص دقيق للوحة الأم وتغيير البنل التالف.",
      },
    });

    // Device 2: NON_COMPLIANT_NOT_RECEIVED (⚠️ غير مطابق لم يتم الاستلام)
    await prisma.device.create({
      data: {
        batchId: batch.id,
        traderId: trader.id,
        brand: "مكيف جري سبليت GREE",
        type: "مكيفات",
        model: "GREE-18-INVERTER",
        serialNumber: `SN-GREE-${Math.floor(100000 + Math.random() * 900000)}`,
        condition: "NEW",
        cartonStatus: "GOOD",
        accessoriesStatus: "بدون ملحقات",
        inspectionResult: "NOT_MATCH",
        faultType: "غير مطابق للمواصفات",
        defectType: "الجهاز يختلف تماماً عن الفاتورة المرفقة والموديل المطلوب",
        decision: "NON_COMPLIANT_NOT_RECEIVED",
        inspectorName,
        inspectionDate: new Date(),
        notes: "تم رفض استلام الشحنة لعدم المطابقة للمواصفات والبراند المطلوب، وجاري استرجاع الجهاز للمندوب.",
      },
    });

    // Device 3: READY_FOR_DELIVERY (📦 جاهز للتسليم)
    await prisma.device.create({
      data: {
        batchId: batch.id,
        traderId: trader.id,
        brand: "شاشة سامسونج ذكية",
        type: "شاشات",
        model: "SAMSUNG-QE65Q60B",
        serialNumber: `SN-SAM-${Math.floor(100000 + Math.random() * 900000)}`,
        condition: "USED",
        cartonStatus: "GOOD",
        accessoriesStatus: "كامل ملحقاته",
        inspectionResult: "MATCH",
        faultType: "تم الإصلاح بنجاح",
        defectType: "تم تبديل دايود الإضاءة الخلفية واختبار التشغيل المستمر لمدة 24 ساعة",
        decision: "READY_FOR_DELIVERY",
        inspectorName,
        inspectionDate: new Date(),
        notes: "تم فحص الجهاز وإصلاحه بالورشة، وجاري التواصل مع المندوب لاستلامه وتسليمه للعميل بحالة ممتازة.",
      },
    });

    // Device 4: RETURNED_COMPLIANT (🔄 مرتجع مطابق)
    await prisma.device.create({
      data: {
        batchId: batch.id,
        traderId: trader.id,
        brand: "ميكروويف دانسات DANSAT",
        type: "ميكروويف",
        model: "DMW-20L-M",
        serialNumber: `SN-DAN-${Math.floor(100000 + Math.random() * 900000)}`,
        condition: "NEW",
        cartonStatus: "GOOD",
        accessoriesStatus: "كامل ملحقاته",
        inspectionResult: "MATCH",
        faultType: "مرتجع سليم",
        defectType: "لا يوجد عيوب مصنعية أو تشغيلية والجهاز مطابق بالكامل للبيان",
        decision: "RETURNED_COMPLIANT",
        inspectorName,
        inspectionDate: new Date(),
        notes: "تم قبول الجهاز كمرتجع مطابق للمواصفات وسلامته التشغيلية 100%، وتم نقله للمخزون الرئيسي للمستودع.",
      },
    });

    // Device 5: NON_COMPLIANT_RECEIVED_WITH_OVERRIDE (📝 غير مطابق تم الاستلام بتعميد)
    await prisma.device.create({
      data: {
        batchId: batch.id,
        traderId: trader.id,
        brand: "تلفزيون تي سي إل TCL",
        type: "شاشات",
        model: "TCL-55P635",
        serialNumber: `SN-TCL-${Math.floor(100000 + Math.random() * 900000)}`,
        condition: "USED",
        cartonStatus: "DAMAGED",
        accessoriesStatus: "غير كامل ملحقاته (بدون ريموت)",
        inspectionResult: "NOT_MATCH",
        faultType: "غير مطابق (مقبول بتعميد)",
        defectType: "الشحنة تفتقر للريموت والكرتون تالف ولكن تم الاستلام بتعميد الإدارة للتصفية",
        decision: "NON_COMPLIANT_RECEIVED_WITH_OVERRIDE",
        inspectorName,
        inspectionDate: new Date(),
        notes: "تم استلام الجهاز استثناءً بتعميد خطي معتمد من إدارة المستودعات لوجود تالف بالكرتون وفقدان الريموت، وتم تحويله لقسم المستودع المخفض.",
      },
    });

    // Revalidate routes
    revalidatePath("/reports");
    revalidatePath("/batches");
    revalidatePath(`/batches/${batch.id}`);
    revalidatePath("/");

    return { success: true, batchId: batch.id };
  } catch (error: any) {
    console.error("Error generating demo devices for reports:", error);
    return { success: false, error: error.message || "حدث خطأ غير متوقع أثناء توليد البيانات" };
  }
}
