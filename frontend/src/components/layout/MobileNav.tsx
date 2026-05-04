"use client";

import React from "react";
import Link from "next/link";
import { Home, Search, ShoppingCart, User, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export const MobileNav = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  const getAccountHref = () => {
    if (!isAuthenticated || !user) return "/auth/login";
    if (user.role === "admin" || user.role === "supervisor") return "/admin";
    if (user.role === "affiliate") return "/affiliate";
    return "/orders";
  };

  const navItems = [
    { label: "Home",     icon: Home,         href: "/" },
    { label: "Search",   icon: Search,       href: "/search" },
    { label: "Wishlist", icon: Heart,        href: "/wishlist" },
    { label: "Cart",     icon: ShoppingCart, href: "/cart",    badge: 3 },
    { label: "Account",  icon: User,         href: getAccountHref() },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E5E5E5] safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ label, icon: Icon, href, badge }) => {
          const active = pathname === href;

          if (label === "Search") {
            return (
              <button
                key={label}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => {
                    document.querySelector<HTMLInputElement>("#navbar-search input")?.focus();
                  }, 100);
                }}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px]",
                  active ? "text-[#FF9900]" : "text-[#888] hover:text-[#111]"
                )}
                aria-label={label}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-150",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-all duration-150",
                    active ? "opacity-100" : "opacity-70"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              id={`mobile-nav-${label.toLowerCase()}`}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px]",
                active
                  ? "text-[#FF9900]"
                  : "text-[#888] hover:text-[#111]"
              )}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              {/* Active pill indicator */}
              {active && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF9900] rounded-full" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-150",
                    active && "scale-110"
                  )}
                  strokeWidth={active ? 2.5 : 1.75}
                />
                {badge && (
                  <span className="absolute -top-2 -right-2 bg-[#FF9900] text-[#111] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] font-semibold transition-all duration-150",
                  active ? "opacity-100" : "opacity-70"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
