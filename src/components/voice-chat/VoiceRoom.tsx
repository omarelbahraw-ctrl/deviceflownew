"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Gift as GiftIcon, Gamepad2, Users, ArrowRight, Volume2, Sparkles } from "lucide-react";
import { GiftPanel, GiftAnimationOverlay, ActiveAnimation, GIFTS, Gift } from "./GiftPanel";
import { GamesDrawer } from "./GamesDrawer";

interface VoiceRoomProps {
  room: {
    id: string;
    title: string;
    hostName: string;
    hostAvatar: string;
    category: string;
    listenersCount: number;
    tags: string[];
    maxSeats: number;
  };
  user: {
    displayName: string;
    avatar: string;
    coins: number;
    level: number;
    activeFrame: string | null;
  };
  leaveRoom: () => void;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  playSound: (type: "coin" | "levelUp" | "gift" | "click" | "win" | "lose") => void;
}

interface Seat {
  index: number;
  userName: string;
  avatar: string;
  isHost: boolean;
  isVacant: boolean;
  isMuted: boolean;
  level: number;
  frame: string | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: "text" | "system" | "gift";
  avatar?: string;
  giftEmoji?: string;
}

const INITIAL_BOTS = [
  { name: "سارة 👸", avatar: "👸", level: 12, frame: "gold" },
  { name: "أبو فهد 🧔", avatar: "🧔", level: 8, frame: null },
  { name: "ريما 👩‍🦰", avatar: "👩‍🦰", level: 4, frame: "silver" },
  { name: "عازف الليل 👨‍🎤", avatar: "👨‍🎤", level: 15, frame: "gold" },
  { name: "خالد السديري 👨", avatar: "👨", level: 6, frame: null },
];

const BOT_MESSAGES = [
  "هلا والله بالجميع، منورين الروم!",
  "أبو شهاب شغل لنا شيلة كفو فديتك 🎶",
  "عاش شباب السعودية وأهل الخليج 🇸🇦",
  "تبون نلعب تخمين كروت؟ الكرت الثالث فيه 3x!",
  "أحد يجرب يلف عجلة الحظ، شكلها تعطي جوائز أسطورية اليوم 😍",
  "أهلاً بالقادمين الجدد، منورين يا كرام 🌸",
  "روم فخم كالعادة 🔥",
  "لا تنسون الهدايا يا جماعة، نبي نوصل ليفل جديد!",
];

export function VoiceRoom({
  room,
  user,
  leaveRoom,
  spendCoins,
  addCoins,
  addXp,
  playSound,
}: VoiceRoomProps) {
  // Seats configuration
  const [seats, setSeats] = useState<Seat[]>([]);
  const [userSeatIndex, setUserSeatIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingSeats, setSpeakingSeats] = useState<number[]>([]);
  const [viewerCount, setViewerCount] = useState(room.listenersCount);

  // Chat Feed state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);

  // Gift animation state
  const [activeAnimation, setActiveAnimation] = useState<ActiveAnimation | null>(null);

  // Initialize room seats and messages
  useEffect(() => {
    // Set Host on seat 0, bots on random seats
    const initialSeats: Seat[] = Array.from({ length: 9 }).map((_, idx) => {
      if (idx === 0) {
        return {
          index: 0,
          userName: room.hostName,
          avatar: room.hostAvatar,
          isHost: true,
          isVacant: false,
          isMuted: false,
          level: 25,
          frame: "gold",
        };
      }
      // Populate some seats with bots
      const botMap: Record<number, typeof INITIAL_BOTS[0]> = {
        1: INITIAL_BOTS[0], // Seat 1
        3: INITIAL_BOTS[1], // Seat 3
        4: INITIAL_BOTS[2], // Seat 4
        6: INITIAL_BOTS[3], // Seat 6
        7: INITIAL_BOTS[4], // Seat 7
      };

      if (botMap[idx]) {
        return {
          index: idx,
          userName: botMap[idx].name,
          avatar: botMap[idx].avatar,
          isHost: false,
          isVacant: false,
          isMuted: false,
          level: botMap[idx].level,
          frame: botMap[idx].frame,
        };
      }

      return {
        index: idx,
        userName: `مقعد ${idx}`,
        avatar: "",
        isHost: false,
        isVacant: true,
        isMuted: false,
        level: 0,
        frame: null,
      };
    });

    setSeats(initialSeats);

    // Initial messages
    setMessages([
      { id: "sys-1", sender: "نظام الغرفة", text: `أهلاً بك في غرفة [${room.title}]`, type: "system" },
      { id: "sys-2", sender: "نظام الغرفة", text: `يرجى الالتزام بالقواعد والاحترام المتبادل.`, type: "system" },
      { id: "msg-0", sender: room.hostName, text: "يا مرحباً بكل الحاضرين، تفضلوا حيّاكم الله!", type: "text", avatar: room.hostAvatar },
    ]);
  }, [room]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulation: Speaking seats animation loop
  useEffect(() => {
    const speakInterval = setInterval(() => {
      const activeSpeakers: number[] = [];
      
      // Randomly select 1-3 bots/host to "speak"
      seats.forEach((seat) => {
        if (!seat.isVacant && !seat.isMuted) {
          // If it's the user and user is muted, skip
          if (seat.index === userSeatIndex && isMuted) return;

          // 25% chance of speaking
          if (Math.random() < 0.25) {
            activeSpeakers.push(seat.index);
          }
        }
      });

      setSpeakingSeats(activeSpeakers);
    }, 2000);

    return () => clearInterval(speakInterval);
  }, [seats, userSeatIndex, isMuted]);

  // Simulation: Bot messages & Random Gifting simulation
  useEffect(() => {
    const botInterval = setInterval(() => {
      // 30% chance a bot says something in chat
      if (Math.random() < 0.3) {
        const botSeats = seats.filter(s => !s.isVacant && !s.isHost && s.index !== userSeatIndex);
        if (botSeats.length > 0) {
          const randomBot = botSeats[Math.floor(Math.random() * botSeats.length)];
          const randomText = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];

          setMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: randomBot.userName,
              text: randomText,
              type: "text",
              avatar: randomBot.avatar
            }
          ]);
        }
      }

      // 10% chance a bot sends a gift to the host or someone else
      if (Math.random() < 0.1) {
        const botSeats = seats.filter(s => !s.isVacant && s.index !== userSeatIndex);
        if (botSeats.length > 1) {
          const sender = botSeats[Math.floor(Math.random() * botSeats.length)];
          // Find different receiver
          const receiverOptions = seats.filter(s => !s.isVacant && s.index !== sender.index);
          const receiver = receiverOptions[Math.floor(Math.random() * receiverOptions.length)] || seats[0];

          // Pick a random gift (weighted towards cheaper ones)
          const isExpensive = Math.random() < 0.15;
          const giftOptions = isExpensive 
            ? GIFTS.filter(g => g.category === "luxury" || g.category === "premium")
            : GIFTS.filter(g => g.category === "common");
          
          const gift = giftOptions[Math.floor(Math.random() * giftOptions.length)];

          // Log in chat
          setMessages(prev => [
            ...prev,
            {
              id: `gift-${Date.now()}`,
              sender: "نظام الهدايا",
              text: `${sender.userName} أهدى ${gift.name} ${gift.emoji} لـ ${receiver.userName}`,
              type: "gift",
              giftEmoji: gift.emoji
            }
          ]);

          // Trigger screen animation for bots' gifts if premium or luxury!
          if (gift.category !== "common" || Math.random() < 0.3) {
            triggerGiftAnimation(gift, sender.userName, receiver.userName);
          }
        }
      }

      // Slightly fluctuate viewer count
      setViewerCount(prev => Math.max(10, prev + Math.floor(Math.random() * 7) - 3));

    }, 6000);

    return () => clearInterval(botInterval);
  }, [seats, userSeatIndex]);

  // Seating actions
  const toggleSeat = (seatIdx: number) => {
    playSound("click");
    
    // Seat is vacant: Sit on it
    if (seats[seatIdx].isVacant) {
      // If user is already on another seat, vacate it first
      let updatedSeats = [...seats];
      if (userSeatIndex !== null) {
        updatedSeats[userSeatIndex] = {
          ...updatedSeats[userSeatIndex],
          userName: `مقعد ${userSeatIndex}`,
          avatar: "",
          isVacant: true,
          level: 0,
          frame: null,
        };
      }

      updatedSeats[seatIdx] = {
        index: seatIdx,
        userName: user.displayName,
        avatar: user.avatar,
        isHost: false,
        isVacant: false,
        isMuted: isMuted,
        level: user.level,
        frame: user.activeFrame,
      };

      setSeats(updatedSeats);
      setUserSeatIndex(seatIdx);
      addXp(10); // Reward XP for claiming a seat

      setMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "النظام",
          text: `صعد ${user.displayName} إلى المنصة في المقعد ${seatIdx}`,
          type: "system"
        }
      ]);
    } else {
      // Seat is occupied
      const occupiedSeat = seats[seatIdx];
      
      // If it's the user's seat: Leave it
      if (userSeatIndex === seatIdx) {
        let updatedSeats = [...seats];
        updatedSeats[seatIdx] = {
          index: seatIdx,
          userName: `مقعد ${seatIdx}`,
          avatar: "",
          isHost: false,
          isVacant: true,
          isMuted: false,
          level: 0,
          frame: null,
        };
        setSeats(updatedSeats);
        setUserSeatIndex(null);
        
        setMessages(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "النظام",
            text: `نزل ${user.displayName} من المنصة إلى قائمة الحاضرين`,
            type: "system"
          }
        ]);
      } else {
        // Just clicked another bot's avatar
        // Prompt a small fun message or greetings
        setMessages(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "تفاعل",
            text: `أرسل ${user.displayName} غمزة ترحيبية 😉 إلى ${occupiedSeat.userName}`,
            type: "system"
          }
        ]);
      }
    }
  };

  const handleSendTextMessage = () => {
    if (!chatInput.trim()) return;

    playSound("click");
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: user.displayName,
        text: chatInput,
        type: "text",
        avatar: user.avatar
      }
    ]);

    setChatInput("");
    addXp(3); // Earn XP for chat participation
  };

  const triggerGiftAnimation = (gift: Gift, sender: string, recipient: string) => {
    setActiveAnimation({
      id: `anim-${Date.now()}`,
      giftId: gift.id,
      senderName: sender,
      recipientName: recipient,
      emoji: gift.emoji,
      giftName: gift.name,
    });

    // Clear after 3 seconds
    setTimeout(() => {
      setActiveAnimation(null);
    }, 3000);
  };

  const handleGiftSent = (gift: Gift, recipientName: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `gift-${Date.now()}`,
        sender: "نظام الهدايا",
        text: `${user.displayName} أهدى ${gift.name} ${gift.emoji} لـ ${recipientName}`,
        type: "gift",
        giftEmoji: gift.emoji
      }
    ]);

    triggerGiftAnimation(gift, user.displayName, recipientName);
  };

  const addSystemMessage = (msgText: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "مسابقة",
        text: msgText,
        type: "system"
      }
    ]);
  };

  // Compile list of possible gift recipients (everyone sitting on the seats except user)
  const giftRecipients = seats
    .filter(s => !s.isVacant && s.userName !== user.displayName)
    .map(s => ({ id: `seat-${s.index}`, name: s.userName }));

  // Add Host explicitly if they are not already in the list
  if (!giftRecipients.some(r => r.name === room.hostName) && room.hostName !== user.displayName) {
    giftRecipients.unshift({ id: "host", name: room.hostName });
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950 overflow-hidden">
      
      {/* Gifting Animation Overlay */}
      <GiftAnimationOverlay activeAnimation={activeAnimation} />

      {/* Room Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 border-b border-slate-900 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={leaveRoom}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-base font-bold truncate max-w-[180px]">{room.title}</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] text-indigo-400 font-bold border border-indigo-500/20">
                {room.category}
              </span>
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3 text-slate-500" />
                <span>{viewerCount}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={leaveRoom}
          className="rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 px-4 py-1.5 text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-md"
        >
          خروج
        </button>
      </div>

      {/* Main Room Body (Stage + Chat Scroll) */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* THE STAGE (Grid Layout) */}
        <div className="bg-slate-900/35 border border-slate-900/70 rounded-2xl p-4 shadow-inner">
          <div className="grid grid-cols-3 gap-y-5 gap-x-2 text-center">
            
            {/* Host Seat - Centered at the top */}
            <div className="col-span-3 flex justify-center mb-1">
              {seats[0] && (
                <div className="relative flex flex-col items-center">
                  <div className="relative">
                    {/* Glowing Speaking Ring */}
                    {speakingSeats.includes(0) && (
                      <motion.div
                        layoutId="hostSpeakRing"
                        className="absolute inset-0 -m-1 rounded-full border-2 border-indigo-400 animate-ping opacity-75"
                      />
                    )}
                    
                    <button
                      onClick={() => toggleSeat(0)}
                      className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border-2 select-none ${
                        seats[0].frame === "gold" ? "border-yellow-500 ring-2 ring-yellow-500/20" : "border-slate-700"
                      }`}
                    >
                      <span className="text-3xl">{seats[0].avatar}</span>
                    </button>

                    {/* Host Icon Badge */}
                    <span className="absolute bottom-[-4px] right-[-4px] rounded-full bg-indigo-500 border border-slate-950 text-[9px] font-black px-1.5 py-0.5 text-white">
                      المضيف
                    </span>
                  </div>

                  <span className="mt-2 text-xs font-bold text-slate-200 truncate max-w-[80px]">
                    {seats[0].userName}
                  </span>
                  
                  <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 px-1 rounded border border-yellow-500/10 mt-0.5">
                    Lv.{seats[0].level}
                  </span>
                </div>
              )}
            </div>

            {/* Guest Seats (1-8 Grid) */}
            {seats.slice(1).map((seat) => (
              <div key={seat.index} className="flex flex-col items-center">
                <div className="relative">
                  {/* Glowing Speaking Ring */}
                  {speakingSeats.includes(seat.index) && (
                    <div className="absolute inset-0 -m-1 rounded-full border-2 border-purple-500 animate-ping opacity-75" />
                  )}

                  <button
                    onClick={() => toggleSeat(seat.index)}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                      seat.isVacant
                        ? "bg-slate-950/80 border-dashed border-slate-800 hover:border-slate-600 text-slate-500"
                        : seat.frame === "gold"
                        ? "bg-slate-800 border-yellow-500 ring-2 ring-yellow-500/20"
                        : seat.frame === "silver"
                        ? "bg-slate-800 border-slate-300 ring-2 ring-slate-300/20"
                        : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    {seat.isVacant ? (
                      <span className="text-lg font-light">+</span>
                    ) : (
                      <span className="text-2.5xl select-none">{seat.avatar}</span>
                    )}
                  </button>

                  {/* Seat Mic Indicator if Muted / Vacant label */}
                  {!seat.isVacant && seat.isMuted && (
                    <span className="absolute bottom-[-3px] right-[-3px] rounded-full bg-red-600 border border-slate-950 p-0.5 text-white">
                      <MicOff className="h-2 w-2" />
                    </span>
                  )}

                  {seat.isVacant && (
                    <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 rounded bg-slate-900 border border-slate-800 text-[8px] font-bold px-1 py-0.2 text-slate-500">
                      {seat.index}
                    </span>
                  )}
                </div>

                <span className="mt-1.5 text-[11px] font-bold text-slate-300 truncate max-w-[70px]">
                  {seat.isVacant ? "صعود" : seat.userName}
                </span>

                {!seat.isVacant && (
                  <span className={`text-[8px] font-bold px-1 rounded mt-0.5 border ${
                    seat.level >= 10 ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/10" : "text-slate-500 bg-slate-900 border-slate-800"
                  }`}>
                    Lv.{seat.level}
                  </span>
                )}
              </div>
            ))}

          </div>
        </div>

        {/* CHAT BOX (Scrolling Feed) */}
        <div className="flex-1 min-h-[160px] bg-slate-900/10 border border-slate-900/60 rounded-2xl p-3 flex flex-col justify-end overflow-hidden">
          <div className="overflow-y-auto space-y-2 max-h-[220px] pr-1 no-scrollbar select-none text-right">
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs">
                {msg.type === "system" && (
                  <div className="bg-slate-950/40 border border-slate-900 px-3 py-1.5 rounded-lg text-slate-400 font-semibold leading-relaxed">
                    📢 {msg.text}
                  </div>
                )}
                {msg.type === "gift" && (
                  <div className="bg-gradient-to-r from-yellow-950/20 via-purple-950/20 to-transparent border-r-2 border-yellow-500 px-3 py-1.5 text-yellow-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-spin" />
                    <span>{msg.text}</span>
                  </div>
                )}
                {msg.type === "text" && (
                  <div className="flex items-start gap-2 bg-slate-950/10 px-2 py-1 rounded">
                    {msg.avatar && <span className="text-sm select-none">{msg.avatar}</span>}
                    <div className="flex-1">
                      <span className="font-extrabold text-indigo-300 ml-1.5">{msg.sender}:</span>
                      <span className="text-slate-200 leading-normal">{msg.text}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

      </div>

      {/* Bottom Action bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-900 bg-slate-950/90 z-20 backdrop-blur-md flex items-center justify-between gap-3">
        
        {/* Mic control */}
        <button
          onClick={() => {
            playSound("click");
            const nextMute = !isMuted;
            setIsMuted(nextMute);
            
            // Sync user's seat mute state
            if (userSeatIndex !== null) {
              setSeats(prev => prev.map(s => s.index === userSeatIndex ? { ...s, isMuted: nextMute } : s));
            }
          }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
            isMuted
              ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Text Input */}
        <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendTextMessage()}
            placeholder="اكتب رسالة في الروم..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none border-none text-right"
          />
          <button
            onClick={handleSendTextMessage}
            disabled={!chatInput.trim()}
            className="p-1 rounded-lg text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors"
          >
            <Send className="h-4.5 w-4.5 transform rotate-180" />
          </button>
        </div>

        {/* Game and Gift openers */}
        <div className="flex gap-2">
          {/* Games button */}
          <button
            onClick={() => { playSound("click"); setIsGamesOpen(true); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-purple-400 hover:text-purple-300 hover:border-slate-700 transition-colors shadow-md"
          >
            <Gamepad2 className="h-5 w-5" />
          </button>

          {/* Gift button */}
          <button
            onClick={() => { playSound("click"); setIsGiftOpen(true); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <GiftIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Floating Drawers */}
      <AnimatePresence>
        {isGiftOpen && (
          <GiftPanel
            isOpen={isGiftOpen}
            onClose={() => { playSound("click"); setIsGiftOpen(false); }}
            userCoins={user.coins}
            openStore={() => {}} // Store is opened from controller global states
            spendCoins={spendCoins}
            addXp={addXp}
            playSound={playSound}
            recipients={giftRecipients}
            onGiftSent={handleGiftSent}
          />
        )}

        {isGamesOpen && (
          <GamesDrawer
            isOpen={isGamesOpen}
            onClose={() => { playSound("click"); setIsGamesOpen(false); }}
            userCoins={user.coins}
            spendCoins={spendCoins}
            addCoins={addCoins}
            addXp={addXp}
            playSound={playSound}
            addSystemMessage={addSystemMessage}
            userName={user.displayName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
