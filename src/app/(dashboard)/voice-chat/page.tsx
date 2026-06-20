import { Metadata } from "next";
import { VoiceChatController } from "@/components/voice-chat/VoiceChatController";

export const metadata: Metadata = {
  title: "بيكيفي - دردشة صوتية وألعاب",
  description: "تطبيق بيكيفي للدردشة الصوتية التفاعلية مع أنظمة الشحن والألعاب التنافسية",
};

export default function VoiceChatPage() {
  return <VoiceChatController />;
}
