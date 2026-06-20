"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Check, AlertCircle, ShieldCheck } from "lucide-react";

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  addCoins: (amount: number) => void;
  playSound: (type: "coin" | "levelUp" | "gift" | "click" | "win" | "lose") => void;
}

interface Package {
  id: string;
  coins: number;
  bonus: number;
  price: string;
  usd: number;
  popular?: boolean;
}

const PACKAGES: Package[] = [
  { id: "pkg-1", coins: 100, bonus: 0, price: "$0.99", usd: 0.99 },
  { id: "pkg-2", coins: 500, bonus: 50, price: "$4.99", usd: 4.99, popular: true },
  { id: "pkg-3", coins: 1200, bonus: 150, price: "$9.99", usd: 9.99 },
  { id: "pkg-4", coins: 3100, bonus: 500, price: "$24.99", usd: 24.99 },
  { id: "pkg-5", coins: 6500, bonus: 1200, price: "$49.99", usd: 49.99 },
  { id: "pkg-6", coins: 15000, bonus: 3500, price: "$99.99", usd: 99.99 },
];

export function StoreModal({ isOpen, onClose, addCoins, playSound }: StoreModalProps) {
  const [purchaseStep, setPurchaseStep] = useState<"list" | "processing" | "success">("list");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  const handlePurchase = (pkg: Package) => {
    playSound("click");
    setSelectedPkg(pkg);
    setPurchaseStep("processing");

    // Simulate payment gateway processing
    setTimeout(() => {
      playSound("win");
      addCoins(pkg.coins + pkg.bonus);
      setPurchaseStep("success");
    }, 1500);
  };

  const handleReset = () => {
    playSound("click");
    setPurchaseStep("list");
    setSelectedPkg(null);
  };

  // Generate simple particles for purchase success
  const renderConfetti = () => {
    return Array.from({ length: 20 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      return (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0.5, 1.2, 0.5],
            x: x,
            y: y,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute text-yellow-400 font-bold pointer-events-none select-none text-xl"
        >
          🪙
        </motion.div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <Coins className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold">متجر الكوينز الذهبية</h2>
              <p className="text-xs text-slate-400">اشحن رصيدك لتتمكن من إرسال الهدايا ولعب الألعاب</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body content based on step */}
        <div className="py-6 min-h-[340px] flex flex-col justify-center">
          {purchaseStep === "list" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {PACKAGES.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePurchase(pkg)}
                  className={`relative cursor-pointer overflow-hidden rounded-xl border p-4 text-center transition-all ${
                    pkg.popular
                      ? "border-indigo-500 bg-indigo-600/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute top-0 right-0 rounded-bl-lg bg-indigo-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      شائع 🔥
                    </span>
                  )}
                  
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 mb-2">
                    <Coins className="h-7 w-7" />
                  </div>

                  <h3 className="text-lg font-bold text-yellow-400">
                    {(pkg.coins).toLocaleString()} كوينز
                  </h3>
                  
                  {pkg.bonus > 0 ? (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      +{pkg.bonus} إضافية
                    </span>
                  ) : (
                    <span className="inline-block mt-1 text-[11px] text-slate-500">حزمة أساسية</span>
                  )}

                  <div className="mt-4 rounded-lg bg-slate-950/80 py-2 text-sm font-bold text-white border border-slate-800/80">
                    {pkg.price}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {purchaseStep === "processing" && (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <Coins className="absolute h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">جاري معالجة الدفع...</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-1">
                  نقوم بالاتصال ببوابة الدفع الآمنة بشكل تجريبي لشحن {selectedPkg?.coins} كوينز.
                </p>
              </div>
            </div>
          )}

          {purchaseStep === "success" && (
            <div className="relative flex flex-col items-center justify-center space-y-4 text-center overflow-hidden py-4">
              {/* Confetti generator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {renderConfetti()}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              >
                <Check className="h-8 w-8 stroke-[3]" />
              </motion.div>

              <div>
                <h3 className="text-2xl font-extrabold text-green-400">تم الشحن بنجاح!</h3>
                <p className="text-sm text-slate-300 mt-2 max-w-sm">
                  تمت إضافة <span className="font-bold text-yellow-400">{((selectedPkg?.coins || 0) + (selectedPkg?.bonus || 0)).toLocaleString()} كوينز</span> إلى محفظتك بنجاح.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleReset}
                  className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                  شحن المزيد
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  حسناً، إغلاق
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 border-t border-slate-800 pt-4 text-[11px] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-green-500/80" />
          <span>تطبيق تجريبي. المدفوعات محاكاة بالكامل ومجانية لأغراض العرض التقديمي.</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
