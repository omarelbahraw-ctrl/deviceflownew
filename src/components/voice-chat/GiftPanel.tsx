"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Send, Sparkles } from "lucide-react";

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  xpAward: number;
  category: "common" | "premium" | "luxury";
}

export const GIFTS: Gift[] = [
  // Common
  { id: "gift-rose", name: "وردة جورية", emoji: "🌹", cost: 10, xpAward: 5, category: "common" },
  { id: "gift-heart", name: "قلب نابض", emoji: "❤️", cost: 20, xpAward: 10, category: "common" },
  { id: "gift-coffee", name: "قهوة عربية", emoji: "☕", cost: 50, xpAward: 25, category: "common" },
  // Premium
  { id: "gift-perfume", name: "عطر ملكي", emoji: "🧴", cost: 150, xpAward: 75, category: "premium" },
  { id: "gift-ring", name: "خاتم الماس", emoji: "💍", cost: 500, xpAward: 250, category: "premium" },
  { id: "gift-crown", name: "تاج ذهبي", emoji: "👑", cost: 1000, xpAward: 500, category: "premium" },
  // Luxury
  { id: "gift-car", name: "سيارة رياضية", emoji: "🏎️", cost: 2500, xpAward: 1250, category: "luxury" },
  { id: "gift-castle", name: "قلعة السلطان", emoji: "🏰", cost: 5000, xpAward: 2500, category: "luxury" },
];

interface GiftPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  openStore: () => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  playSound: (type: "coin" | "levelUp" | "gift" | "click" | "win" | "lose") => void;
  recipients: { id: string; name: string }[];
  onGiftSent: (gift: Gift, recipientName: string) => void;
}

export function GiftPanel({
  isOpen,
  onClose,
  userCoins,
  openStore,
  spendCoins,
  addXp,
  playSound,
  recipients,
  onGiftSent,
}: GiftPanelProps) {
  const [activeTab, setActiveTab] = useState<"common" | "premium" | "luxury">("common");
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredGifts = GIFTS.filter((g) => g.category === activeTab);
  const selectedGift = GIFTS.find((g) => g.id === selectedGiftId);
  const targetRecipient = recipients.find((r) => r.id === selectedRecipientId) || { id: "all", name: "الجميع" };

  const handleSendGift = () => {
    if (!selectedGiftId || !selectedGift) return;

    setErrorMsg(null);
    const success = spendCoins(selectedGift.cost);
    if (success) {
      playSound("gift");
      addXp(selectedGift.xpAward);
      onGiftSent(selectedGift, targetRecipient.name);
      
      // Clear selection after sending common items, keep for spamming if they want
      if (selectedGift.category === "luxury") {
        onClose();
      }
    } else {
      setErrorMsg("رصيدك من الكوينز غير كافٍ! اشحن الآن.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 z-40 rounded-t-3xl border-t border-slate-800 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-md"
    >
      {/* Target selector */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 overflow-x-auto gap-2">
        <span className="text-xs font-bold text-slate-400 shrink-0">إرسال إلى:</span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          <button
            onClick={() => { playSound("click"); setSelectedRecipientId("all"); }}
            className={`rounded-full px-3 py-1 text-xs font-medium border shrink-0 transition-colors ${
              selectedRecipientId === "all"
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            🌟 الجميع
          </button>
          {recipients.map((r) => (
            <button
              key={r.id}
              onClick={() => { playSound("click"); setSelectedRecipientId(r.id); }}
              className={`rounded-full px-3 py-1 text-xs font-medium border shrink-0 transition-colors ${
                selectedRecipientId === r.id
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              🎙️ {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-900 pb-2">
        {[
          { key: "common", label: "شعبية" },
          { key: "premium", label: "فاخرة" },
          { key: "luxury", label: "أسطورية" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { playSound("click"); setActiveTab(t.key as any); }}
            className={`pb-2 text-sm font-bold relative transition-colors ${
              activeTab === t.key ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
            {activeTab === t.key && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-4 gap-3 py-4 max-h-[180px] overflow-y-auto mt-2">
        {filteredGifts.map((gift) => (
          <div
            key={gift.id}
            onClick={() => { playSound("click"); setSelectedGiftId(gift.id); }}
            className={`relative flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${
              selectedGiftId === gift.id
                ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
            }`}
          >
            <span className="text-3xl mb-1 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)] select-none">
              {gift.emoji}
            </span>
            <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
              {gift.name}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 mt-1">
              <span>{gift.cost}</span>
              <Coins className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-black text-yellow-400">{userCoins.toLocaleString()}</span>
          </div>
          <button
            onClick={() => { onClose(); openStore(); }}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1.5 rounded-full border border-indigo-500/20"
          >
            شحن
          </button>
        </div>

        {errorMsg && (
          <span className="text-xs font-medium text-red-400 animate-pulse">{errorMsg}</span>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            disabled={!selectedGiftId}
            onClick={handleSendGift}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <span>إرسال هدية</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------
// FULL SCREEN GIFT ANIMATION ENGINE
// ----------------------------------------------------

export interface ActiveAnimation {
  id: string;
  giftId: string;
  senderName: string;
  recipientName: string;
  emoji: string;
  giftName: string;
}

interface GiftAnimationOverlayProps {
  activeAnimation: ActiveAnimation | null;
}

export function GiftAnimationOverlay({ activeAnimation }: GiftAnimationOverlayProps) {
  if (!activeAnimation) return null;

  const { giftId, senderName, recipientName, emoji, giftName } = activeAnimation;

  // Render different layouts based on the gift tier
  const isLuxury = giftId === "gift-car" || giftId === "gift-castle";
  const isPremium = giftId === "gift-perfume" || giftId === "gift-ring" || giftId === "gift-crown";

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Ambient background flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-indigo-500/20 backdrop-blur-[1px]"
      />

      <AnimatePresence>
        {/* Luxury: Sports Car Anim */}
        {giftId === "gift-car" && (
          <div className="relative w-full h-full flex flex-col justify-center items-center">
            {/* Speed lines */}
            <div className="absolute inset-x-0 h-40 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent skew-y-3" />
            
            <motion.div
              initial={{ x: "120vw", rotate: 5, scale: 0.8 }}
              animate={{
                x: ["120vw", "0vw", "-10vw", "-120vw"],
                scale: [0.8, 1.3, 1.4, 0.7],
                rotate: [5, -2, -5, -15],
              }}
              transition={{
                duration: 2.2,
                times: [0, 0.35, 0.65, 1],
                ease: "easeInOut",
              }}
              className="text-[100px] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-10"
            >
              🏎️
            </motion.div>

            {/* Neon banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.9], y: 0 }}
              transition={{ duration: 2.2, times: [0, 0.2, 0.8, 1] }}
              className="absolute bottom-20 bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-indigo-950/90 border border-indigo-500/40 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
              <span className="text-sm font-extrabold text-white tracking-wide">
                كفووو! <span className="text-indigo-400">{senderName}</span> أهدى سيارة رياضية <span className="text-yellow-400">🏎️</span> لـ <span className="text-purple-400">{recipientName}</span>!
              </span>
              <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
            </motion.div>
          </div>
        )}

        {/* Luxury: Castle Anim */}
        {giftId === "gift-castle" && (
          <div className="relative w-full h-full flex flex-col justify-center items-center">
            {/* Glowing columns of light */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: [0, 0.6, 0.6, 0], scaleY: [0, 1, 1, 0] }}
              transition={{ duration: 2.5 }}
              className="absolute bottom-0 w-80 h-[80%] bg-gradient-to-t from-yellow-500/20 via-purple-500/10 to-transparent blur-xl origin-bottom"
            />

            {/* Castle building */}
            <motion.div
              initial={{ y: "100vh", opacity: 0, scale: 0.5 }}
              animate={{
                y: ["100vh", "0vh", "0vh", "-30vh"],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1.2, 0.8],
              }}
              transition={{ duration: 2.5, times: [0, 0.3, 0.8, 1], ease: "easeOut" }}
              className="text-[120px] filter drop-shadow-[0_20px_40px_rgba(234,179,8,0.4)] z-10 select-none"
            >
              🏰
            </motion.div>

            {/* Neon banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.9], y: 0 }}
              transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1] }}
              className="absolute bottom-20 bg-gradient-to-r from-yellow-950/90 via-purple-950/90 to-yellow-950/90 border border-yellow-500/40 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
            >
              <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
              <span className="text-sm font-extrabold text-white tracking-wide">
                يا سلام! <span className="text-yellow-400">{senderName}</span> شيّد قلعة السلطان <span className="text-yellow-400">🏰</span> لـ <span className="text-purple-400">{recipientName}</span>!
              </span>
              <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
            </motion.div>
          </div>
        )}

        {/* Premium: Crown, Ring, Perfume */}
        {isPremium && (
          <div className="relative w-full h-full flex flex-col justify-center items-center">
            {/* Pulsing ring */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.5, 2], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.5 }}
              className="absolute h-40 w-40 rounded-full border-2 border-indigo-400"
            />

            {/* Gift Icon */}
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{
                y: [ -100, 0, 0, 100 ],
                opacity: [ 0, 1, 1, 0 ],
                scale: [ 0.5, 1.4, 1.4, 0.8 ],
                rotate: [ -20, 0, 0, 20 ]
              }}
              transition={{ duration: 1.8, times: [0, 0.3, 0.8, 1] }}
              className="text-[90px] filter drop-shadow-[0_10px_20px_rgba(99,102,241,0.3)] z-10"
            >
              {emoji}
            </motion.div>

            {/* Standard banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 1, 0], y: 0 }}
              transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1] }}
              className="absolute bottom-24 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-black/40"
            >
              <span className="text-xs font-bold text-slate-200">
                أرسل <span className="text-indigo-400">{senderName}</span> {giftName} {emoji} إلى {recipientName}
              </span>
            </motion.div>
          </div>
        )}

        {/* Common: Rose, Heart, Coffee */}
        {!isLuxury && !isPremium && (
          <div className="relative w-full h-full">
            {/* Multiple emojis floating upwards */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: `${20 + Math.random() * 60}vw`,
                  y: "100vh",
                  scale: 0.5,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  y: "-10vh",
                  scale: [0.5, 1.2, 0.7],
                  opacity: [0, 1, 1, 0],
                  x: [`${30 + Math.random() * 40}vw`, `${20 + Math.random() * 60}vw`],
                  rotate: Math.random() * 180 - 90,
                }}
                transition={{
                  duration: 1.5 + Math.random() * 0.8,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className="absolute text-5xl select-none"
              >
                {emoji}
              </motion.div>
            ))}

            {/* Small text box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: 0 }}
              transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs text-slate-300"
            >
              {senderName} أهدى {giftName} {emoji} لـ {recipientName}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
