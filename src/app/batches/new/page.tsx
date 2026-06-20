import { prisma } from "@/lib/prisma";
import NewBatchForm from "./NewBatchForm";

export default async function NewBatchPage() {
  let batchCount = 0;
  try {
    batchCount = await prisma.batch.count();
  } catch (error) {
    console.warn("Database connection failed. Defaulting batch count to 0.", error);
  }
  const nextReportNumber = `SS-${1001 + batchCount}`;

  const traders = await prisma.trader.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });

  const existingDevices = await prisma.device.findMany({ select: { brand: true, model: true } });
  const uniqueBrands = Array.from(new Set(existingDevices.map(d => d.brand)));
  const uniqueModels = Array.from(new Set(existingDevices.map(d => d.model)));

  return (
    <div className="max-w-4xl mx-auto">
      <NewBatchForm 
        traders={traders} 
        uniqueBrands={uniqueBrands} 
        uniqueModels={uniqueModels} 
        nextReportNumber={nextReportNumber}
      />
    </div>
  );
}
