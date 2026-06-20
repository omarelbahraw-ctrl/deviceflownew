"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, HelpCircle, RefreshCw, Trophy } from "lucide-react";

interface GamesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  playSound: (type: "coin" | "levelUp" | "gift" | "click" | "win" | "lose") => void;
  addSystemMessage: (msg: string) => void;
  userName: string;
}

const WHEEL_SECTORS = [
  { prize: "+100 كوينز", value: 100, type: "coins", color: "#6366f1" },
  { prize: "حظ أوفر 😢", value: 0, type: "nothing", color: "#1e293b" },
  { prize: "+200 كوينز", value: 200, type: "coins", color: "#a855f7" },
  { prize: "لقب: الملك 👑", value: 0, type: "title", color: "#eab308" },
  { prize: "حظ أوفر 😢", value: 0, type: "nothing", color: "#1e293b" },
  { prize: "+50 كوينز", value: 50, type: "coins", color: "#3b82f6" },
  { prize: "+500 كوينز", value: 500, type: "coins", color: "#10b981" },
  { prize: "إطار VIP ذهبي", value: 0, type: "frame", color: "#ec4899" },
];

export function GamesDrawer({
  isOpen,
  onClose,
  userCoins,
  spendCoins,
  addCoins,
  addXp,
  playSound,
  addSystemMessage,
  userName,
}: GamesDrawerProps) {
  const [activeTab, setActiveTab] = useState<"wheel" | "cards">("wheel");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);

  // Cards state
  const [cardStatus, setCardStatus] = useState<"idle" | "selected" | "revealed">("idle");
  const [cards, setCards] = useState<{ id: number; multiplier: number; value: string; isChosen: boolean }[]>([
    { id: 1, multiplier: 0, value: "0x 😢", isChosen: false },
    { id: 2, multiplier: 1.5, value: "1.5x 🪙", isChosen: false },
    { id: 3, multiplier: 3, value: "3x 🌟", isChosen: false },
  ]);
  const [cardsBet] = useState(50);
  const [cardsResult, setCardsResult] = useState<string | null>(null);

  // Handle Wheel Spin
  const spinWheel = () => {
    if (isSpinning) return;
    setErrorMsg(null);
    setWheelPrize(null);

    const cost = 50;
    const success = spendCoins(cost);
    if (!success) {
      setErrorMsg("رصيدك غير كافٍ للعب! (تكلفة اللعبة 50 كوينز)");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsSpinning(true);
    playSound("click");
    
    // Choose a random sector (0 to 7)
    const sectorIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sectorAngle = 360 / WHEEL_SECTORS.length;
    
    // Calculate rotation: 10 full spins (3600 deg) + angle to align pointer at top (270 - center of sector)
    const targetDegree = 3600 + (270 - (sectorIndex * sectorAngle + sectorAngle / 2));
    setWheelRotation(targetDegree);

    // Stop wheel spinning after transition time (4s)
    setTimeout(() => {
      setIsSpinning(false);
      const wonSector = WHEEL_SECTORS[sectorIndex];
      setWheelPrize(wonSector.prize);
      addXp(15); // Add XP for playing

      if (wonSector.type === "coins" && wonSector.value > 0) {
        playSound("win");
        addCoins(wonSector.value);
        addSystemMessage(`🎉 ربح ${userName} عدد ${wonSector.value} كوينز من عجلة الحظ!`);
      } else if (wonSector.type === "title") {
        playSound("levelUp");
        addSystemMessage(`👑 حصل ${userName} على لقب الملك من عجلة الحظ!`);
      } else if (wonSector.type === "frame") {
        playSound("levelUp");
        addSystemMessage(`✨ ربح ${userName} إطار VIP ذهبي من عجلة الحظ!`);
      } else {
        playSound("lose");
      }

      // Reset wheel position state slightly (without snap back animation) so it can spin again
      setWheelRotation(targetDegree % 360);
    }, 4100);
  };

  // Cards Game Logic
  const shuffleCards = () => {
    playSound("click");
    setErrorMsg(null);
    setCardStatus("idle");
    setCardsResult(null);

    const multipliers = [0, 1.5, 3].sort(() => Math.random() - 0.5);
    const names = {
      0: "0x 😢 حظ أوفر",
      1.5: "1.5x 🪙 (75 كوينز)",
      3: "3x 🌟 (150 كوينز)"
    };

    setCards(
      multipliers.map((m, index) => ({
        id: index + 1,
        multiplier: m,
        value: names[m as 0 | 1.5 | 3],
        isChosen: false
      }))
    );
  };

  const handleCardClick = (cardId: number) => {
    if (cardStatus !== "idle") return;
    setErrorMsg(null);

    const success = spendCoins(cardsBet);
    if (!success) {
      setErrorMsg("رصيدك غير كافٍ للعب! (تكلفة اللعبة 50 كوينز)");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    addXp(15);
    const chosenCard = cards.find(c => c.id === cardId);
    if (!chosenCard) return;

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isChosen: true } : c));
    setCardStatus("selected");

    setTimeout(() => {
      setCardStatus("revealed");
      const winnings = Math.floor(cardsBet * chosenCard.multiplier);

      if (winnings > 0) {
        playSound("win");
        addCoins(winnings);
        setCardsResult(`مبروك! لقد ربحت ${winnings} كوينز.`);
        if (chosenCard.multiplier === 3) {
          addSystemMessage(`🃏 محظوظ! ربح ${userName} الجائزة الكبرى 3x (${winnings} كوينز) في تخمين الكروت!`);
        }
      } else {
        playSound("lose");
        setCardsResult("حظ أوفر المرة القادمة!");
      }
    }, 800);
  };

  if (!isOpen) return null;

  const numSectors = WHEEL_SECTORS.length;
  const sectorAngle = 360 / numSectors;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 z-40 rounded-t-3xl border-t border-slate-800 bg-slate-950/98 p-5 text-white shadow-2xl backdrop-blur-md"
    >
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => { playSound("click"); setActiveTab("wheel"); }}
            className={`text-sm font-bold relative pb-2 transition-colors ${
              activeTab === "wheel" ? "text-indigo-400 font-extrabold" : "text-slate-400"
            }`}
          >
            🎡 عجلة الحظ
            {activeTab === "wheel" && (
              <motion.div layoutId="activeGameTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
          <button
            onClick={() => { playSound("click"); setActiveTab("cards"); }}
            className={`text-sm font-bold relative pb-2 transition-colors ${
              activeTab === "cards" ? "text-indigo-400 font-extrabold" : "text-slate-400"
            }`}
          >
            🃏 تخمين الكروت
            {activeTab === "cards" && (
              <motion.div layoutId="activeGameTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          <Coins className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-xs font-black text-yellow-400">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="min-h-[260px] py-2 flex flex-col items-center justify-center">
        
        {/* WHEEL OF FORTUNE */}
        {activeTab === "wheel" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-44 w-44">
              {/* Pointer indicator */}
              <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 z-20 text-yellow-400 text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ▼
              </div>

              {/* Glowing border ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-800 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse" />

              {/* The Wheel */}
              <motion.svg
                style={{ rotate: wheelRotation }}
                transition={isSpinning ? { duration: 4, ease: [0.15, 0.85, 0.2, 1] } : { duration: 0 }}
                viewBox="0 0 100 100"
                className="h-full w-full rounded-full overflow-hidden select-none"
              >
                <circle cx="50" cy="50" r="50" fill="#020617" />
                {WHEEL_SECTORS.map((sec, idx) => {
                  const startAngle = idx * sectorAngle;
                  const endAngle = startAngle + sectorAngle;

                  // Convert polar to cartesian
                  const radStart = ((startAngle - 90) * Math.PI) / 180;
                  const radEnd = ((endAngle - 90) * Math.PI) / 180;

                  const x1 = 50 + 50 * Math.cos(radStart);
                  const y1 = 50 + 50 * Math.sin(radStart);
                  const x2 = 50 + 50 * Math.cos(radEnd);
                  const y2 = 50 + 50 * Math.sin(radEnd);

                  // Arc drawing path
                  const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Text rotation
                  const textRotation = startAngle + sectorAngle / 2;

                  return (
                    <g key={idx}>
                      <path d={d} fill={sec.color} stroke="#090d16" strokeWidth="0.5" />
                      
                      <text
                        x="50"
                        y="15"
                        fill="#ffffff"
                        fontSize="4"
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${textRotation}, 50, 50)`}
                      >
                        {sec.prize.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
                {/* Center cap */}
                <circle cx="50" cy="50" r="10" fill="#090d16" stroke="#475569" strokeWidth="1" />
                <circle cx="50" cy="50" r="4" fill="#6366f1" />
              </motion.svg>
            </div>

            {/* Controller/Actions */}
            <div className="flex flex-col items-center space-y-2 w-full text-center">
              <button
                disabled={isSpinning}
                onClick={spinWheel}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-sm px-8 py-2.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>ابدأ الدوران (50 كوينز)</span>
                <RefreshCw className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
              </button>

              <div className="h-6">
                <AnimatePresence mode="wait">
                  {wheelPrize && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-1"
                    >
                      <Trophy className="h-4 w-4 text-yellow-400 animate-bounce" />
                      <span>مبروك! لقد حصلت على: {wheelPrize}</span>
                    </motion.div>
                  )}
                  {errorMsg && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-bold text-red-400">
                      {errorMsg}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* CARD MATCHING / GUESSING */}
        {activeTab === "cards" && (
          <div className="flex flex-col items-center space-y-4 w-full">
            {/* Cards Grid */}
            <div className="flex gap-4 items-center justify-center py-2 select-none">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="relative h-36 w-24 cursor-pointer perspective"
                >
                  <motion.div
                    animate={{ rotateY: cardStatus === "revealed" || (cardStatus === "selected" && card.isChosen) ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", damping: 15 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full h-full rounded-xl"
                  >
                    {/* Card Front (Facedown - Blue design) */}
                    <div
                      style={{ backfaceVisibility: "hidden" }}
                      className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-900 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-black/40 text-center"
                    >
                      <HelpCircle className="h-10 w-10 text-indigo-400/70 mb-1" />
                      <span className="text-[10px] text-indigo-300 font-bold">اختر كرت</span>
                    </div>

                    {/* Card Back (Flipped - showing reward) */}
                    <div
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      className={`absolute inset-0 border-2 rounded-xl flex flex-col items-center justify-center shadow-lg text-center ${
                        card.isChosen
                          ? "bg-slate-900 border-yellow-500 shadow-yellow-500/10"
                          : "bg-slate-950/80 border-slate-800 opacity-60"
                      }`}
                    >
                      {card.isChosen && (
                        <span className="absolute top-1 right-1 text-[8px] bg-yellow-500 text-slate-950 font-bold px-1 rounded">
                          اختيارك
                        </span>
                      )}
                      
                      <span className="text-2xl font-black mb-1">
                        {card.multiplier === 0 ? "😢" : card.multiplier === 1.5 ? "🪙" : "🌟"}
                      </span>
                      <h4 className={`text-base font-extrabold ${card.multiplier > 0 ? "text-yellow-400" : "text-slate-500"}`}>
                        {card.value}
                      </h4>
                      <p className="text-[8px] text-slate-400 mt-1">تخمين الكروت</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Controller/Actions */}
            <div className="flex flex-col items-center space-y-2 text-center w-full">
              {cardStatus === "revealed" ? (
                <button
                  onClick={shuffleCards}
                  className="rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-extrabold text-sm px-8 py-2.5 shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>العب مجدداً (50 كوينز)</span>
                  <RefreshCw className="h-4 w-4" />
                </button>
              ) : (
                <div className="text-xs font-semibold text-slate-400 py-2.5">
                  كلفة المحاولة 50 كوينز. اختر كرت واحد لتضاعف رصيدك!
                </div>
              )}

              <div className="h-6">
                <AnimatePresence mode="wait">
                  {cardsResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-1"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>{cardsResult}</span>
                    </motion.div>
                  )}
                  {errorMsg && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-bold text-red-400">
                      {errorMsg}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Close Button */}
      <div className="flex justify-end border-t border-slate-900 pt-3 mt-3">
        <button
          onClick={onClose}
          className="rounded-xl bg-slate-900 border border-slate-800 px-5 py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </motion.div>
  );
}
