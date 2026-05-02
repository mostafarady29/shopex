"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const router = useRouter();

  const { register, loading, error: authError } = useAuthStore();
  const [localError, setLocalError] = useState("");

  const error = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!firstName || !lastName || !email || !password) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (password !== passwordConfirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    try {
      await register({ firstName, lastName, email, password });
      router.push("/");
    } catch (err) {
      // Error handled by store
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
        {/* Main Register Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8 mb-6">
          <h1 className="text-2xl font-black text-[#111] mb-6 tracking-tight">
            Create account
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-[#FFF7EC] border-l-4 border-[#FF9900] rounded-r-lg flex items-start gap-3 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-[#FF9900] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#333] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-bold text-[#111] mb-1.5"
                >
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#AAA]" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-bold text-[#111] mb-1.5"
                >
                  Last name
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#111] mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#AAA]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#111] mb-1.5"
              >
                Password
              </label>
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
                  placeholder="At least 6 characters"
                />
              </div>
              <p className="mt-1 text-xs text-[#555] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#0066c0]" />
                Passwords must be at least 6 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-bold text-[#111] mb-1.5"
              >
                Re-enter password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#AAA]" />
                </div>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm px-4 py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-[#555]">
            By creating an account, you agree to ShopEx&apos;s{" "}
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
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <p className="text-sm font-medium text-[#111]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#0066c0] hover:text-[#FF9900] hover:underline transition-colors inline-flex items-center">
                Sign in
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
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
