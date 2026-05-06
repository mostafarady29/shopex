"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/axios";

export const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");

    try {
      await api.post("/newsletter/subscribe", { email });
      setSubmitted(true);
      setEmail("");
      setTimeout(() => {
        setSubmitted(false);
        setError("");
      }, 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#111111] py-16">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <Mail className="w-3.5 h-3.5" />
            Newsletter
          </div>
          <h2 className="text-3xl font-black text-white mb-3">
            Exclusive deals, straight to you
          </h2>
          <p className="text-[#888] mb-6 text-sm leading-relaxed">
            Get early access to flash sales, personalized picks, and
            members-only offers. No spam, ever.
          </p>

          {error && (
            <div className="mb-4 flex items-center justify-center gap-3 bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF5555] rounded-xl px-6 py-3 animate-fade-up">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="flex items-center justify-center gap-3 bg-[#00A650]/10 border border-[#00A650]/20 text-[#00A650] rounded-xl px-6 py-4 animate-fade-up">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">
                You&apos;re in! Check your inbox for a welcome offer.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF9900] disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm px-7 py-3 rounded-xl transition-colors flex-shrink-0 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[130px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
              </button>
            </form>
          )}

          <p className="text-[#555] text-xs mt-3">
            By subscribing you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-[#FF9900] transition-colors">
              Privacy Policy
            </Link>
            . Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
