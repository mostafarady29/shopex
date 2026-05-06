"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempUserId, setTempUserId] = useState("");
  const router = useRouter();
  
  const { login, verify2FA, loading, error: authError, isAuthenticated, user } = useAuthStore();
  const [localError, setLocalError] = useState("");

  const error = localError || authError;

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "admin" || user.role === "supervisor") {
        router.push("/admin");
      } else if (user.role === "affiliate") {
        router.push("/affiliate");
      } else {
        router.push("/orders");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (needs2FA) {
      if (!twoFactorCode) {
        setLocalError("Please enter your 2FA code.");
        return;
      }
      try {
        await verify2FA(tempUserId, twoFactorCode);
        // Redirect happens automatically
      } catch (err) {
        // Error handled by store
      }
      return;
    }

    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    try {
      const result = await login({ email, password });
      if (result && result.requires2fa) {
        setNeeds2FA(true);
        setTempUserId(result.userId as string);
      }
      // Redirect happens automatically if no 2FA via useEffect
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Logo */}
      <Link
        href="/"
        className="flex items-center gap-0.5 mb-8 hover:opacity-80 transition-opacity"
      >
        <span className="text-3xl font-black tracking-tight text-[#111111]">
          Shop
        </span>
        <span className="text-3xl font-black tracking-tight text-[#FF9900]">
          Ex
        </span>
      </Link>

      <div className="w-full max-w-[400px]">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8 mb-6">
          <h1 className="text-2xl font-black text-[#111] mb-6 tracking-tight">
            Sign in
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-[#FFF7EC] border-l-4 border-[#FF9900] rounded-r-lg flex items-start gap-3 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-[#FF9900] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#333] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!needs2FA ? (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-[#111] mb-1.5"
                  >
                    Email or mobile phone number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#AAA]" />
                    </div>
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-[#111]"
                    >
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-semibold text-[#FF9900] hover:text-[#E68A00] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#AAA]" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-bold text-[#111] mb-1.5 text-center"
                >
                  Enter Authenticator Code
                </label>
                <input
                  id="twoFactorCode"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="block w-full px-3 py-3 border border-[#CCC] rounded-xl text-2xl tracking-[0.5em] text-center placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm px-4 py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {needs2FA ? "Verifying..." : "Signing in..."}
                </>
              ) : (
                needs2FA ? "Verify Code" : "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-[#555]">
            By continuing, you agree to ShopEx&apos;s{" "}
            <Link href="/terms" className="text-[#0066c0] hover:text-[#FF9900] hover:underline transition-colors">
              Conditions of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#0066c0] hover:text-[#FF9900] hover:underline transition-colors">
              Privacy Notice
            </Link>
            .
          </p>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E5E5]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-[#888] text-xs">
                New to ShopEx?
              </span>
            </div>
          </div>

          <Link
            href="/auth/register"
            className="mt-6 w-full flex items-center justify-center px-4 py-2.5 border border-[#D5D9D9] shadow-sm rounded-xl text-sm font-semibold text-[#111] bg-[#F7FAFA] hover:bg-[#F0F2F2] transition-colors active:scale-[0.98]"
          >
            Create your ShopEx account
          </Link>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#0066c0]">
          <Link href="/terms" className="hover:text-[#FF9900] hover:underline transition-colors">
            Conditions of Use
          </Link>
          <Link href="/privacy" className="hover:text-[#FF9900] hover:underline transition-colors">
            Privacy Notice
          </Link>
          <Link href="/help" className="hover:text-[#FF9900] hover:underline transition-colors">
            Help
          </Link>
        </div>
        <p className="text-center text-xs text-[#555] mt-4">
          © 2026 ShopEx Inc.
        </p>
      </div>
    </div>
  );
}
