export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-lg font-medium text-gray-500 animate-pulse">جاري تحميل البيانات...</p>
      </div>
    </div>
  );
}
