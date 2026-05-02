"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Wallet,
  BookOpen,
  LogOut,
  Bell,
  Medal
} from "lucide-react";

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/affiliate", icon: LayoutDashboard },
    { label: "Affiliate Links", href: "/affiliate/links", icon: LinkIcon },
    { label: "Wallet & Payouts", href: "/affiliate/wallet", icon: Wallet },
    { label: "Resources", href: "/affiliate/resources", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-sans">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-[#E5E5E5] flex flex-col fixed h-full z-10">
        <div className="h-[68px] flex items-center px-6 border-b border-[#E5E5E5]">
          <Link href="/" className="flex items-center gap-0.5 group">
            <span className="text-xl font-black tracking-tight text-[#111111] group-hover:text-[#FF9900] transition-colors">
              Shop<span className="text-[#FF9900]">Ex</span>
            </span>
          </Link>
        </div>

        {/* Affiliate Level Badge (Gamification) */}
        <div className="px-6 py-5 border-b border-[#E5E5E5]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-[#888]" />
              <span className="text-sm font-black text-[#111]">Silver Tier</span>
            </div>
            <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
              <div className="bg-[#111] h-full" style={{ width: "65%" }}></div>
            </div>
            <p className="text-xs text-[#888] font-medium">$350 to Gold Tier</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#111] text-white shadow-sm"
                    : "text-[#555] hover:bg-[#F7F7F7] hover:text-[#111]"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#888]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9900] to-[#E68A00] text-white flex items-center justify-center text-xs font-bold">
              {user.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#111] truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-[#888] truncate">Affiliate ID: AF-10492</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-[68px] bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex-1">
            {/* Context aware space if needed */}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#555] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <Link href="/" className="text-xs font-semibold text-[#888] hover:text-[#111] flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Return to Shop
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
