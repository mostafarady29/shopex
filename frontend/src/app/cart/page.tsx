"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Trash2, Plus, Minus, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function CartPage() {
  const { items, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <h1 className="text-3xl font-black text-[#111] tracking-tight mb-8">
          Shopping Cart
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-12 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">Sign in to view your cart</h2>
            <p className="text-[#555] mb-8 max-w-sm mx-auto">
              Please sign in to add items to your cart and start shopping.
            </p>
            <Link
              href="/auth/login"
              className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Cart Items */}
            <div className="w-full lg:flex-1 space-y-4">
              {items.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-12 text-center">
                  <div className="text-6xl mb-6">🛒</div>
                  <h2 className="text-2xl font-bold text-[#111] mb-2">
                    Your cart is empty
                  </h2>
                  <p className="text-[#555] mb-8 max-w-sm mx-auto">
                    Looks like you haven&apos;t added anything to your cart yet.
                    Start shopping to fill it up!
                  </p>
                  <Link
                    href="/products"
                    className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                  <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-[#E5E5E5] bg-[#F9F9F9] text-xs font-bold text-[#555] uppercase tracking-wider">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-3 text-right">Price</div>
                  </div>

                  <ul className="divide-y divide-[#E5E5E5]">
                    {items.map((item) => (
                      <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:items-center">
                        {/* Product Details */}
                        <div className="col-span-6 flex gap-4">
                          <div className="w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 bg-[#F7F7F7] rounded-xl flex items-center justify-center border border-[#E5E5E5] overflow-hidden">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-4xl">📦</span>
                            )}
                          </div>
                          <div className="flex flex-col justify-between py-1">
                            <div>
                              <Link
                                href={`/products/${item.product.id}`}
                                className="font-bold text-[#111] hover:text-[#FF9900] transition-colors line-clamp-2 leading-snug"
                              >
                                {item.product.name}
                              </Link>
                              {item.product.brand && (
                                <p className="text-xs text-[#555] mt-1">{item.product.brand}</p>
                              )}
                              <p className="text-xs text-[#00A650] font-semibold mt-1">
                                {item.product.stock > 0 ? "In Stock" : "Out of Stock"}
                              </p>
                            </div>
                            <div className="mt-2 flex gap-3 text-sm font-medium">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[#0066c0] hover:text-[#FF9900] hover:underline flex items-center gap-1"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mobile View: Price & Quantity row */}
                        <div className="flex sm:hidden items-center justify-between mt-2">
                          <div className="flex items-center gap-2 font-bold text-lg text-[#111]">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="flex items-center border border-[#CCC] rounded-lg overflow-hidden bg-white shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[#F0F0F0] text-[#555] transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold border-x border-[#CCC] py-1 bg-[#F9F9F9]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[#F0F0F0] text-[#555] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Desktop View: Quantity */}
                        <div className="hidden sm:flex col-span-3 items-center justify-center">
                          <div className="flex items-center border border-[#CCC] rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-9 h-9 flex items-center justify-center hover:bg-[#F0F0F0] text-[#555] transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-sm font-bold border-x border-[#CCC] py-1.5 bg-[#F9F9F9]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-[#F0F0F0] text-[#555] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Desktop View: Price */}
                        <div className="hidden sm:flex col-span-3 items-center justify-end">
                          <div className="text-right">
                            <span className="font-black text-lg text-[#111]">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                              <div className="text-xs text-[#888] line-through mt-0.5">
                                ${(item.product.comparePrice * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 bg-[#F9F9F9] border-t border-[#E5E5E5] flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-[#555]">Subtotal ({totalItems} items):</p>
                      <p className="text-2xl font-black text-[#111] leading-none mt-1">
                        ${subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            {items.length > 0 && (
              <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-[100px]">
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6 mb-4">
                  <h2 className="text-lg font-black text-[#111] mb-4 border-b border-[#F0F0F0] pb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm text-[#555] mb-6 border-b border-[#F0F0F0] pb-4">
                    <div className="flex justify-between">
                      <span>Items ({totalItems}):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping & handling:</span>
                      <span>{subtotal > 100 ? "$0.00" : "$10.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated tax:</span>
                      <span>${(subtotal * 0.14).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-6">
                    <span className="font-bold text-[#111]">Order Total:</span>
                    <span className="text-2xl font-black text-[#B12704]">
                      ${(subtotal + (subtotal > 100 ? 0 : 10) + subtotal * 0.14).toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </Link>

                  <div className="mt-4 flex items-start gap-2 text-xs text-[#555]">
                    <ShieldCheck className="w-4 h-4 text-[#00A650] flex-shrink-0" />
                    <p>
                      Safe and secure transaction. Your personal information is
                      protected.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-5">
                  <div className="flex items-center gap-2 mb-2 text-sm font-bold text-[#111]">
                    <HelpCircle className="w-4 h-4 text-[#FF9900]" />
                    Need help?
                  </div>
                  <p className="text-xs text-[#555] mb-3 leading-relaxed">
                    Have questions about your order or our return policy? We&apos;re here
                    to help 24/7.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
