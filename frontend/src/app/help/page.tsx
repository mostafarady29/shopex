"use client";

import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { HelpCircle, Package, RefreshCcw, CreditCard, ShieldCheck, MessageSquare } from "lucide-react";
import Link from "next/link";

const helpTopics = [
  { icon: Package, title: "Track Your Order", desc: "Check the status and delivery date of your orders.", link: "/orders" },
  { icon: RefreshCcw, title: "Returns & Refunds", desc: "30-day hassle-free returns. Easy refund process.", link: "/terms" },
  { icon: CreditCard, title: "Payment Issues", desc: "Help with payment methods, failed transactions, and billing.", link: "#" },
  { icon: ShieldCheck, title: "Account Security", desc: "Manage your password, two-factor authentication, and privacy.", link: "/privacy" },
  { icon: MessageSquare, title: "Contact Support", desc: "Chat with our AI assistant or email our support team.", link: "#" },
  { icon: HelpCircle, title: "FAQ", desc: "Find answers to the most commonly asked questions.", link: "#" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#111] tracking-tight mb-2">How Can We Help?</h1>
          <p className="text-[#555] max-w-md mx-auto">Find answers, manage your orders, and get in touch with our support team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpTopics.map((topic) => (
            <Link
              key={topic.title}
              href={topic.link}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-lg hover:border-[#FF9900]/30 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-[#FFF7EC] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF9900]/20 transition-colors">
                <topic.icon className="w-6 h-6 text-[#FF9900]" />
              </div>
              <h3 className="font-bold text-[#111] mb-1 group-hover:text-[#FF9900] transition-colors">{topic.title}</h3>
              <p className="text-sm text-[#555]">{topic.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8 text-center">
          <h2 className="text-xl font-bold text-[#111] mb-2">Still need help?</h2>
          <p className="text-[#555] mb-6">Our AI assistant is available 24/7 — click the chat icon in the bottom-right corner.</p>
          <p className="text-sm text-[#555]">Or email us at <span className="text-[#0066c0] font-bold">support@shopex.com</span></p>
        </div>
      </main>
      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
