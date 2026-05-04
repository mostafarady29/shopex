"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Zap,
  Package,
  Laptop,
  Shirt,
  Home as HomeIcon,
  Heart,
  X,
  Menu,
  Mic,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

const categories = [
  { label: "Electronics", icon: Laptop, href: "/products?category=Electronics" },
  { label: "Men's Clothing", icon: Shirt,  href: "/products?category=Men's Clothing" },
  { label: "Home & Kitchen",  icon: HomeIcon, href: "/products?category=Home & Kitchen" },
  { label: "Deals",       icon: Zap,    href: "/deals" },
  { label: "Orders",      icon: Package, href: "/orders" },
  { label: "Wishlist",    icon: Heart,  href: "/wishlist" },
];

const suggestions = [
  "Wireless Earbuds",
  "Running Shoes",
  "Coffee Maker",
  "Laptop Stand",
  "Yoga Mat",
  "Smart Watch",
];

export const Navbar = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setFocused(false);
    }
  };

  const handleVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      router.push(`/products?search=${encodeURIComponent(speechResult)}`);
      setFocused(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const { cartCount, getCartCount } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      getCartCount();
    }
  }, [isAuthenticated, getCartCount]);

  const filtered = query
    ? suggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions;

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="bg-[#111111] text-white text-xs py-1.5 text-center font-medium tracking-wide">
        🎉 Free delivery on orders over $35 &nbsp;|&nbsp;{" "}
        <span className="text-[#FF9900]">Shop Prime Deals →</span>
      </div>

      {/* ── Main Nav ────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-md" : "border-b border-[#E5E5E5]"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-4 h-[68px] flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-0.5 group"
            aria-label="ShopEx Home"
          >
            <span className="text-2xl font-black tracking-tight text-[#111111] group-hover:text-[#FF9900] transition-colors duration-150">
              Shop
            </span>
            <span className="text-2xl font-black tracking-tight text-[#FF9900]">
              Ex
            </span>
          </Link>

          {/* Category Dropdown */}
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#555] hover:text-[#111] cursor-pointer select-none transition-colors">
            <span>All</span>
            <ChevronDown className="w-4 h-4" />
          </div>

          {/* Search ──────────────────────────────────────────── */}
          <div className="flex-1 relative min-w-0" id="navbar-search">
            <form
              onSubmit={handleSearch}
              className={`flex items-center w-full bg-[#F7F7F7] rounded-xl border-2 transition-all duration-200 min-w-0 ${
                focused
                  ? "border-[#FF9900] bg-white shadow-sm"
                  : "border-transparent hover:border-[#E5E5E5]"
              }`}
            >
              <Search className="ml-2 sm:ml-3 w-4 h-4 text-[#888] flex-shrink-0 hidden sm:block" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search products..."
                className="flex-1 bg-transparent py-2 sm:py-2.5 px-3 text-sm text-[#111] placeholder:text-[#AAAAAA] focus:outline-none min-w-0 w-full text-ellipsis"
                aria-label="Search products"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mr-1 p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-[#888]" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`mr-1 p-1.5 rounded-lg transition-colors ${
                  isListening ? "bg-[#FF9900]/20 animate-pulse" : "hover:bg-[#F0F0F0]"
                }`}
                aria-label="Voice search"
              >
                <Mic className={`w-4 h-4 ${isListening ? "text-[#FF9900]" : "text-[#888]"}`} />
              </button>
              <button
                type="submit"
                className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 mr-1"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {focused && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-up">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA]">
                    Trending Searches
                  </p>
                </div>
                <ul>
                  {filtered.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setQuery(s);
                          router.push(`/products?search=${encodeURIComponent(s)}`);
                          setFocused(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#333] hover:bg-[#FFF7EC] hover:text-[#FF9900] flex items-center gap-3 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-[#AAAAAA]" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Account */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex relative group">
                <div className="flex flex-col items-start px-3 py-1.5 rounded-xl hover:bg-[#F7F7F7] transition-colors cursor-pointer">
                  <span className="text-[10px] text-[#888] font-medium">Hello, {user.firstName}</span>
                  <span className="text-sm font-bold text-[#111] group-hover:text-[#FF9900] transition-colors flex items-center gap-1">
                    Account & Lists <ChevronDown className="w-3 h-3" />
                  </span>
                </div>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E5E5] rounded-2xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                  <div className="p-4 border-b border-[#E5E5E5]">
                    <p className="font-bold text-[#111]">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-[#555]">{user.email}</p>
                  </div>
                  <ul className="py-2">
                    <li><Link href="/orders" className="block px-4 py-2 text-sm text-[#333] hover:bg-[#FFF7EC] hover:text-[#FF9900]">Your Orders</Link></li>
                    <li><Link href="/wishlist" className="block px-4 py-2 text-sm text-[#333] hover:bg-[#FFF7EC] hover:text-[#FF9900]">Your Wishlist</Link></li>
                    {user.role === 'admin' && (
                      <li><Link href="/admin" className="block px-4 py-2 text-sm text-[#CC0C39] font-bold hover:bg-[#FFF7EC]">Admin Dashboard</Link></li>
                    )}
                    {user.role === 'affiliate' && (
                      <li><Link href="/affiliate" className="block px-4 py-2 text-sm text-[#FF9900] font-bold hover:bg-[#FFF7EC]">Affiliate Dashboard</Link></li>
                    )}
                  </ul>
                  <div className="border-t border-[#E5E5E5] py-2">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-[#555] hover:bg-[#F7F7F7] hover:text-[#111] flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                id="navbar-account"
                className="hidden sm:flex flex-col items-start px-3 py-1.5 rounded-xl hover:bg-[#F7F7F7] transition-colors group"
              >
                <span className="text-[10px] text-[#888] font-medium">Hello, sign in</span>
                <span className="text-sm font-bold text-[#111] group-hover:text-[#FF9900] transition-colors flex items-center gap-1">
                  Account <ChevronDown className="w-3 h-3" />
                </span>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              id="navbar-cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F7F7F7] transition-colors group"
              aria-label="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-[#111] group-hover:text-[#FF9900] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FF9900] text-[#111] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-sm font-bold text-[#111]">Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[#F7F7F7] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-[#111]" />
            </button>
          </div>
        </div>

        {/* ── Secondary Nav (Category Strip) ───────────────── */}
        <div className="hidden md:block border-t border-[#F0F0F0]">
          <div className="mx-auto max-w-[1400px] px-4">
            <ul className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <li key={cat.label} className="flex-shrink-0">
                  <Link
                    href={cat.href}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm text-[#555] font-medium hover:text-[#FF9900] hover:bg-[#FFF7EC] transition-all duration-150"
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col md:hidden animate-fade-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
              <span className="text-xl font-black">
                Shop<span className="text-[#FF9900]">Ex</span>
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5 text-[#555]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-[#AAAAAA] mb-2">
                Browse
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-[#333] hover:bg-[#FFF7EC] hover:text-[#FF9900] transition-colors"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </Link>
              ))}
            </div>
            <div className="p-5 border-t border-[#F0F0F0]">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#FF9900]/20 rounded-full flex items-center justify-center text-[#FF9900] font-bold">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#111]">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-[#555]">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 w-full bg-[#CC0C39]/10 text-[#CC0C39] font-bold py-3 px-5 rounded-xl transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'affiliate' && (
                    <Link
                      href="/affiliate"
                      className="flex items-center gap-3 w-full bg-[#FF9900]/10 text-[#FF9900] font-bold py-3 px-5 rounded-xl transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Affiliate Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full bg-[#F7F7F7] hover:bg-[#F0F0F0] text-[#111] font-bold py-3 px-5 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold py-3 px-5 rounded-xl transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
