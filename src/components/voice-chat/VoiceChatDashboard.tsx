"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Crown, Flame, Gamepad2, Plus, Star, Trophy, Users } from "lucide-react";
import { MOCK_ROOMS, UserProfile } from "./VoiceChatController";

interface VoiceChatDashboardProps {
  user: UserProfile;
  joinRoom: (roomId: string) => void;
  openStore: () => void;
  buyVip: (type: "GOLD_VIP" | "SILVER_VIP", cost: number) => boolean;
  selectFrame: (frame: string | null) => void;
}

const LEADERBOARD_GIFTERS = [
  { rank: 1, name: "عازف الليل 👨‍🎤", avatar: "👨‍🎤", score: "124,500 كوينز", frame: "gold" },
  { rank: 2, name: "سارة العتيبي 👸", avatar: "👸", score: "98,200 كوينز", frame: "silver" },
  { rank: 3, name: "أبو فهد 🧔", avatar: "🧔", score: "76,000 كوينز", frame: null },
  { rank: 4, name: "برق نجد 🦅", avatar: "🦅", score: "42,100 كوينز", frame: null },
  { rank: 5, name: "ريما 👩‍🦰", avatar: "👩‍🦰", score: "29,400 كوينز", frame: null },
];

export function VoiceChatDashboard({
  user,
  joinRoom,
  openStore,
  buyVip,
  selectFrame,
}: VoiceChatDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"rooms" | "vip">("rooms");
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const xpNeeded = user.level * 200;
  const xpPercent = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));

  const handleBuyVip = (type: "GOLD_VIP" | "SILVER_VIP", cost: number) => {
    setPurchaseMsg(null);
    const success = buyVip(type, cost);
    if (success) {
      setPurchaseMsg("تهانينا! تم شراء العضوية وتفعيل إطار VIP بنجاح.");
      setTimeout(() => setPurchaseMsg(null), 4000);
    } else {
      setPurchaseMsg("عذراً، رصيدك من الكوينز غير كافٍ لإتمام عملية الشراء.");
      setTimeout(() => setPurchaseMsg(null), 4000);
    }
  };

  return (
    <div className="flex flex-col w-full h-full pb-10">
      
      {/* Profile Bar */}
      <div className="bg-slate-900/60 p-6 border-b border-slate-900 backdrop-blur-md text-right">
        <div className="max-w-4xl mx-auto mb-6 flex flex-row justify-between items-center border-b border-slate-850 pb-4">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 select-none">
            تطبيق بيكيفي (Beykefy) 🎙️
          </h1>
          <span className="text-[10px] text-slate-400 font-extrabold bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            دردشة صوتية وألعاب شحن
          </span>
        </div>
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* User Info */}
          <div className="flex items-center gap-4 text-right w-full md:w-auto">
            <div className="relative">
              {/* Profile frame */}
              {user.activeFrame === "gold" && (
                <div className="absolute inset-0 -m-1.5 rounded-full border-2 border-yellow-500 ring-2 ring-yellow-500/20 animate-pulse pointer-events-none" />
              )}
              {user.activeFrame === "silver" && (
                <div className="absolute inset-0 -m-1.5 rounded-full border-2 border-slate-300 ring-2 ring-slate-300/20 animate-pulse pointer-events-none" />
              )}
              
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl border border-slate-700 shadow-lg select-none">
                {user.avatar}
              </div>

              {/* VIP Icon */}
              {user.vipBadge && (
                <span className="absolute bottom-0 right-0 rounded-full bg-yellow-500 border border-slate-950 p-1 text-slate-950 shadow-md">
                  <Crown className="h-3 w-3 fill-slate-950 stroke-[2.5]" />
                </span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">{user.displayName}</h2>
                {user.vipBadge && (
                  <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">
                    VIP
                  </span>
                )}
              </div>
              
              {/* Level progress bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/10">
                  مستوى {user.level}
                </span>
                <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                  <motion.div
                    className="bg-indigo-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {user.xp}/{xpNeeded} XP
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance & Recharge Button */}
          <div className="flex items-center justify-between bg-slate-950/40 border border-slate-900 rounded-2xl p-3 px-5 w-full md:w-auto gap-10">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-500 font-bold">الرصيد الحالي</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-xl font-black text-yellow-400">
                  {user.coins.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={openStore}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6">
        <div className="flex gap-4 border-b border-slate-900 pb-3">
          <button
            onClick={() => setActiveSubTab("rooms")}
            className={`text-sm font-bold pb-2 relative transition-all ${
              activeSubTab === "rooms" ? "text-indigo-400 font-black" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            🎙️ غرف الدردشة الصوتية
            {activeSubTab === "rooms" && (
              <motion.div layoutId="subtabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("vip")}
            className={`text-sm font-bold pb-2 relative transition-all ${
              activeSubTab === "vip" ? "text-indigo-400 font-black" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            👑 متجر عضوية الـ VIP
            {activeSubTab === "vip" && (
              <motion.div layoutId="subtabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6 flex-1">
        
        {/* ROOMS LIST VIEW & LEADERBOARD */}
        {activeSubTab === "rooms" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Rooms Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-200">أحدث الغرف المتاحة حالياً</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_ROOMS.map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="flex flex-col bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 transition-all shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-950/40 text-2xl border border-indigo-900/50 shadow shadow-indigo-500/10 select-none">
                        {room.hostAvatar}
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-900/80">
                        <Users className="h-3 w-3" />
                        <span>{room.listenersCount}</span>
                      </span>
                    </div>

                    <h4 className="mt-3 font-extrabold text-sm text-slate-200 line-clamp-1 text-right">
                      {room.title}
                    </h4>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2 text-right">
                      {room.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-semibold text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-900"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900/80 pt-3 mt-4">
                      <span className="text-[10px] text-slate-500 font-bold">
                        بواسطة: {room.hostName}
                      </span>
                      <button
                        onClick={() => joinRoom(room.id)}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-1.5 transition-all shadow-md shadow-indigo-600/10"
                      >
                        دخول الغرفة
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-slate-900/35 border border-slate-900/70 rounded-2xl p-4 shadow-lg h-fit text-right">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-900 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-sm font-bold text-slate-200">أكثر الداعمين نشاطاً (أسبوعي)</h3>
              </div>

              <div className="space-y-3">
                {LEADERBOARD_GIFTERS.map((g) => (
                  <div
                    key={g.rank}
                    className="flex items-center justify-between bg-slate-950/20 p-2 rounded-xl border border-slate-900/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black w-4 text-center ${
                        g.rank === 1 ? "text-yellow-500" : g.rank === 2 ? "text-slate-400" : g.rank === 3 ? "text-amber-600" : "text-slate-600"
                      }`}>
                        {g.rank}
                      </span>
                      
                      <div className="relative">
                        {g.frame === "gold" && (
                          <div className="absolute inset-0 -m-1 rounded-full border border-yellow-500 pointer-events-none" />
                        )}
                        {g.frame === "silver" && (
                          <div className="absolute inset-0 -m-1 rounded-full border border-slate-300 pointer-events-none" />
                        )}
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-lg select-none">
                          {g.avatar}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-300 truncate max-w-[90px]">{g.name}</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-[10px] text-yellow-500">
                      <span>{g.score}</span>
                      <Coins className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIP SHOP VIEW */}
        {activeSubTab === "vip" && (
          <div className="space-y-6">
            <div className="text-center space-y-1 py-2">
              <h3 className="text-lg font-black text-yellow-500 flex justify-center items-center gap-2">
                <Crown className="h-6 w-6" />
                <span>عضويات الـ VIP وتزيين الملف الشخصي</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                احصل على إطارات مميزة للملف الشخصي وتاج ذهبي يعكس تميزك ودعمك في الغرف الصوتية
              </p>
            </div>

            {purchaseMsg && (
              <div className={`p-4 rounded-xl border text-sm text-center font-semibold ${
                purchaseMsg.includes("شراء") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {purchaseMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              
              {/* VIP Gold Package */}
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-950/20 via-slate-900/60 to-slate-950 p-6 flex flex-col items-center text-center shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                <span className="absolute top-0 right-0 rounded-bl-lg bg-yellow-500 px-3 py-1 text-[10px] font-black text-slate-950 uppercase tracking-wider">
                  الأفخم ⭐
                </span>

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 mb-3 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <Crown className="h-8 w-8" />
                </div>

                <h4 className="text-lg font-extrabold text-yellow-400">عضوية الـ VIP الذهبية</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  تمنحك إطاراً ذهبياً متوهجاً للملف الشخصي، شارة VIP ذهبية مميزة، وأولوية حجز المقاعد في أي غرفة.
                </p>

                <div className="flex items-center gap-1 text-base font-black text-yellow-500 mt-6">
                  <span>1,000 كوينز</span>
                  <Coins className="h-4.5 w-4.5" />
                </div>

                <button
                  onClick={() => handleBuyVip("GOLD_VIP", 1000)}
                  className="mt-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs px-6 py-2.5 shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
                >
                  شراء العضوية الذهبية
                </button>
              </div>

              {/* VIP Silver Package */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/60 to-slate-950 p-6 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/20 border border-slate-500/40 text-slate-300 mb-3">
                  <Star className="h-8 w-8" />
                </div>

                <h4 className="text-lg font-extrabold text-slate-200">عضوية الـ VIP الفضية</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  تمنحك إطاراً فضياً جميلاً حول صورتك الرمزية وشارة VIP فضية أنيقة تظهر بجانب اسمك.
                </p>

                <div className="flex items-center gap-1 text-base font-black text-yellow-500 mt-6">
                  <span>500 كوينز</span>
                  <Coins className="h-4.5 w-4.5" />
                </div>

                <button
                  onClick={() => handleBuyVip("SILVER_VIP", 500)}
                  className="mt-4 rounded-xl bg-slate-200 hover:bg-white text-slate-950 font-black text-xs px-6 py-2.5 shadow-lg transition-all active:scale-95"
                >
                  شراء العضوية الفضية
                </button>
              </div>

            </div>

            {/* Custom frames inventory */}
            {user.purchasedFrames.length > 0 && (
              <div className="border-t border-slate-900 pt-6 max-w-xl mx-auto text-right">
                <h4 className="text-sm font-bold text-slate-300 mb-3">إطاراتك المشتراة</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => selectFrame(null)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold border ${
                      user.activeFrame === null
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    بدون إطار
                  </button>
                  {user.purchasedFrames.includes("gold") && (
                    <button
                      onClick={() => selectFrame("gold")}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold border ${
                        user.activeFrame === "gold"
                          ? "bg-yellow-500 border-yellow-400 text-slate-950 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      الإطار الذهبي ✨
                    </button>
                  )}
                  {user.purchasedFrames.includes("silver") && (
                    <button
                      onClick={() => selectFrame("silver")}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold border ${
                        user.activeFrame === "silver"
                          ? "bg-slate-300 border-slate-200 text-slate-950 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      الإطار الفضي 🌟
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
