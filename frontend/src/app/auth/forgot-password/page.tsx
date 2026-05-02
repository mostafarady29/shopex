"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    // Mock delay
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1200);
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
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8 mb-6">
          <h1 className="text-2xl font-black text-[#111] mb-2 tracking-tight">
            Password assistance
          </h1>
          <p className="text-sm text-[#555] mb-6">
            Enter the email address associated with your ShopEx account.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-[#FFF7EC] border-l-4 border-[#FF9900] rounded-r-lg flex items-start gap-3 animate-fade-up">
              <AlertCircle className="w-5 h-5 text-[#FF9900] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#333] font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-4 animate-fade-up">
              <div className="w-12 h-12 bg-[#00A650]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-[#00A650]" />
              </div>
              <h3 className="font-bold text-[#111] mb-2">Check your inbox</h3>
              <p className="text-sm text-[#555] mb-6">
                We've sent an email to <span className="font-bold">{email}</span> with instructions to reset your password.
              </p>
              <Link
                href="/auth/login"
                className="w-full bg-[#F7F7F7] hover:bg-[#F0F0F0] text-[#111] font-bold text-sm px-4 py-3 border border-[#CCC] rounded-xl transition-all flex items-center justify-center"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-[#111] mb-1.5"
                >
                  Email address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm px-4 py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
          <p className="text-sm font-medium text-[#111] text-center">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-[#0066c0] hover:text-[#FF9900] hover:underline transition-colors inline-flex items-center">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#0066c0]">
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
