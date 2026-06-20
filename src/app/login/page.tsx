"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User as UserIcon, Shield } from "lucide-react";
import { useTranslation } from "@/components/layout/LanguageContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { t, isRtl } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      try {
        const data = await res.json();
        setError(data.error || t("login_error"));
      } catch (err) {
        setError(isRtl ? "حدث خطأ في الخادم (500). يرجى المحاولة لاحقاً." : "Server error (500). Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("login_title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("login_subtitle")}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative mb-4">
              <label htmlFor="username" className="sr-only">{t("username")}</label>
              <div className={`absolute inset-y-0 ${isRtl ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}>
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 ${isRtl ? "pr-10" : "pl-10"} border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder={t("username")}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">{t("password")}</label>
              <div className={`absolute inset-y-0 ${isRtl ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}>
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 ${isRtl ? "pr-10" : "pl-10"} border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder={t("password")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md"
            >
              {t("btn_login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
