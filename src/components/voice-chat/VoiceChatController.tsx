"use client";

import { useState, useEffect } from "react";
import { VoiceChatDashboard } from "./VoiceChatDashboard";
import { VoiceRoom } from "./VoiceRoom";
import { StoreModal } from "./StoreModal";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  xp: number;
  level: number;
  vipBadge: string | null;
  purchasedFrames: string[];
  activeFrame: string | null;
}

export interface Room {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  category: string;
  listenersCount: number;
  tags: string[];
  maxSeats: number;
}

export const MOCK_ROOMS: Room[] = [
  {
    id: "room-1",
    title: "جلسة وناسة وطرب 🎶",
    hostName: "أبو شهاب",
    hostAvatar: "👨‍🎤",
    category: "طرب وسوالف",
    listenersCount: 142,
    tags: ["أغاني", "شيلات", "روقان"],
    maxSeats: 9
  },
  {
    id: "room-2",
    title: "تحديات وألعاب عجلة الحظ 🎯",
    hostName: "سارة العتيبي",
    hostAvatar: "👸",
    category: "ألعاب ومسابقات",
    listenersCount: 389,
    tags: ["تحدي", "عجلة الحظ", "مسابقات"],
    maxSeats: 9
  },
  {
    id: "room-3",
    title: "مجلس الأصدقاء العام ☕",
    hostName: "خالد الحربي",
    hostAvatar: "🧔",
    category: "تعارف وسوالف",
    listenersCount: 64,
    tags: ["سوالف", "شعر", "قهوة"],
    maxSeats: 9
  },
  {
    id: "room-4",
    title: "مسابقة تخمين الكروت 🃏 (جوائز كوينز)",
    hostName: "برق نجد",
    hostAvatar: "🦅",
    category: "مسابقات",
    listenersCount: 512,
    tags: ["تخمين", "توزيعات", "لايف"],
    maxSeats: 9
  }
];

export function VoiceChatController() {
  const [user, setUser] = useState<UserProfile>({
    username: "user_123",
    displayName: "البطل المحارب",
    avatar: "👑",
    coins: 1250,
    xp: 80,
    level: 1,
    vipBadge: null,
    purchasedFrames: [],
    activeFrame: null,
  });

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpNum, setLevelUpNum] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Sound effects generator using Web Audio API to avoid external assets issues
  const playSound = (type: "coin" | "levelUp" | "gift" | "click" | "win" | "lose") => {
    if (typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "coin") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "levelUp") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "win") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "lose") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.setValueAtTime(130, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "gift") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error("Audio Context error", e);
    }
  };

  // Load state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("voice_chat_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  // Save user state on modification
  const saveUserState = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem("voice_chat_user", JSON.stringify(updatedUser));
  };

  const addCoins = (amount: number) => {
    playSound("coin");
    const updated = { ...user, coins: user.coins + amount };
    saveUserState(updated);
  };

  const spendCoins = (amount: number): boolean => {
    if (user.coins < amount) {
      playSound("lose");
      return false;
    }
    const updated = { ...user, coins: user.coins - amount };
    saveUserState(updated);
    return true;
  };

  const addXp = (amount: number) => {
    let newXp = user.xp + amount;
    let newLevel = user.level;
    let xpNeeded = newLevel * 200;

    let leveledUp = false;
    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      xpNeeded = newLevel * 200;
      leveledUp = true;
    }

    const updated = { ...user, xp: newXp, level: newLevel };
    
    if (leveledUp) {
      setLevelUpNum(newLevel);
      setShowLevelUp(true);
      playSound("levelUp");
      setTimeout(() => {
        setShowLevelUp(false);
      }, 3500);
    }
    
    saveUserState(updated);
  };

  const buyVip = (type: "GOLD_VIP" | "SILVER_VIP", cost: number): boolean => {
    if (spendCoins(cost)) {
      const updated = {
        ...user,
        vipBadge: type,
        activeFrame: type === "GOLD_VIP" ? "gold" : "silver",
        purchasedFrames: Array.from(new Set([...user.purchasedFrames, type === "GOLD_VIP" ? "gold" : "silver"]))
      };
      saveUserState(updated);
      playSound("win");
      return true;
    }
    return false;
  };

  const selectFrame = (frame: string | null) => {
    playSound("click");
    saveUserState({ ...user, activeFrame: frame });
  };

  const joinRoom = (roomId: string) => {
    playSound("click");
    setActiveRoomId(roomId);
  };

  const leaveRoom = () => {
    playSound("click");
    setActiveRoomId(null);
  };

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-lg font-medium">جاري تحميل التطبيق...</span>
        </div>
      </div>
    );
  }

  const activeRoomObj = MOCK_ROOMS.find((r) => r.id === activeRoomId) || null;

  return (
    <div className="relative flex h-full w-full flex-col bg-slate-950 text-white font-sans antialiased overflow-hidden rounded-xl border border-slate-800">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      {/* Main Switchboard */}
      <AnimatePresence mode="wait">
        {activeRoomObj ? (
          <motion.div
            key="room"
            initial={{ opacity: 0, scale: 0.98, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: -50 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <VoiceRoom
              room={activeRoomObj}
              user={user}
              leaveRoom={leaveRoom}
              spendCoins={spendCoins}
              addCoins={addCoins}
              addXp={addXp}
              playSound={playSound}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98, x: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: 50 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full overflow-y-auto"
          >
            <VoiceChatDashboard
              user={user}
              joinRoom={joinRoom}
              openStore={() => { playSound("click"); setIsStoreOpen(true); }}
              buyVip={buyVip}
              selectFrame={selectFrame}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <AnimatePresence>
        {isStoreOpen && (
          <StoreModal
            isOpen={isStoreOpen}
            onClose={() => { playSound("click"); setIsStoreOpen(false); }}
            addCoins={addCoins}
            playSound={playSound}
          />
        )}
      </AnimatePresence>

      {/* Level Up Animation Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
          >
            <div className="relative flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-950 border border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] max-w-sm">
              <div className="absolute top-0 -translate-y-1/2 flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                <Trophy className="h-8 w-8 animate-bounce" />
              </div>
              
              <div className="mt-8 space-y-2">
                <motion.h2 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-2xl font-extrabold text-yellow-400 tracking-wide"
                >
                  ارتفاع المستوى! 🎉
                </motion.h2>
                <p className="text-slate-300 text-sm">ألف مبروك! لقد زاد نشاطك وتفاعلك ووصلت إلى مستوى جديد.</p>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-3xl font-black">
                <span className="text-slate-500 text-xl">{levelUpNum - 1}</span>
                <span className="text-yellow-400 animate-pulse">&rarr;</span>
                <span className="text-yellow-400 bg-yellow-500/20 px-4 py-1 rounded-full border border-yellow-500/40">{levelUpNum}</span>
              </div>

              {/* Sparkle effects */}
              <div className="absolute -top-4 -left-4 text-yellow-400 animate-pulse"><Sparkles className="h-6 w-6" /></div>
              <div className="absolute -bottom-4 -right-4 text-purple-400 animate-pulse"><Sparkles className="h-6 w-6" /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
