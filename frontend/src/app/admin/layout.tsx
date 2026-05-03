"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Bell,
  Search,
  ClipboardList,
  Headphones,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "supervisor"))) {
      router.push("/");
    }
  }, [isAuthenticated, user, loading, router]);

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "supervisor")) {
    return null;
  }

  const navItems = [
    { label: "Overview",        href: "/admin",                icon: LayoutDashboard },
    { label: "Users",           href: "/admin/users",          icon: UserCog },
    { label: "Products",        href: "/admin/products",       icon: Package },
    { label: "Stock Requests",  href: "/admin/stock-requests", icon: ClipboardList },
    { label: "Support Tickets", href: "/admin/support",        icon: Headphones },
    { label: "Orders",          href: "/admin/orders",         icon: ShoppingCart },
    { label: "Affiliates",      href: "/admin/affiliates",     icon: Users },
    { label: "Settings",        href: "/admin/settings",       icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`w-64 bg-white border-r border-[#E5E5E5] flex flex-col fixed h-full z-30 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-[68px] flex items-center justify-between px-6 border-b border-[#E5E5E5]">
          <Link href="/" className="flex items-center gap-0.5 group">
            <span className="text-xl font-black tracking-tight text-[#111111] group-hover:text-[#FF9900] transition-colors">
              Shop<span className="text-[#FF9900]">Ex</span>
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest text-[#888] bg-[#F0F0F0] px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
          <button 
            className="lg:hidden text-[#888] hover:text-[#111]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA] mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#FFF7EC] text-[#FF9900]"
                    : "text-[#555] hover:bg-[#F7F7F7] hover:text-[#111]"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-[#FF9900]" : "text-[#888]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-xs font-bold">
              {user.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#111] truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-[#888] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <header className="h-[68px] bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[#F5F5F7] text-[#111]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-[#F5F5F7] text-sm py-2 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#555] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#CC0C39] rounded-full border border-white"></span>
            </button>
            <Link href="/" className="text-xs font-semibold text-[#888] hover:text-[#111] flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg hover:bg-[#F5F5F7] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Admin</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
