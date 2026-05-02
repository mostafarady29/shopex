"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, CreditCard, CheckCircle, Loader2, MapPin } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const router = useRouter();
  
  const { items, fetchCart, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Shipping form
  const [shipping, setShipping] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "United States",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      // Pre-fill from user data
      if (user) {
        setShipping((s) => ({
          ...s,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
        }));
      }
    }
  }, [isAuthenticated, user]);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingCost = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.14;
  const total = subtotal + shippingCost + tax;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        shippingAddress: shipping,
        paymentMethod: "credit_card",
      };

      const res = await api.post("/orders", orderData);
      setPlacedOrderId(res.data.order?.orderId || "");
      await clearCart();
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center py-12 px-4">
        <Link href="/" className="mb-8">
          <span className="text-3xl font-black text-[#111]">Shop</span>
          <span className="text-3xl font-black text-[#FF9900]">Ex</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8 max-w-[500px] w-full text-center">
          <h1 className="text-2xl font-black text-[#111] mb-4">Sign in to checkout</h1>
          <Link href="/auth/login" className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center py-12 px-4">
        <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
          <span className="text-3xl font-black tracking-tight text-[#111111]">Shop</span>
          <span className="text-3xl font-black tracking-tight text-[#FF9900]">Ex</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-8 max-w-[500px] w-full text-center">
          <div className="w-16 h-16 bg-[#00A650]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#00A650]" />
          </div>
          <h1 className="text-2xl font-black text-[#111] mb-2 tracking-tight">Order placed, thanks!</h1>
          <p className="text-[#555] mb-2">Order #{placedOrderId}</p>
          <p className="text-[#555] mb-6">Confirmation will be sent to {shipping.email}.</p>
          <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-[#555]">
              <span className="font-bold text-[#111]">Shipping to:</span> {shipping.firstName} {shipping.lastName}, {shipping.street}, {shipping.city} {shipping.postalCode}
            </p>
          </div>
          <Link
            href="/orders"
            className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-[0.98]"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Checkout Header */}
      <header className="bg-white border-b border-[#E5E5E5] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-2xl font-black tracking-tight text-[#111111]">Shop</span>
            <span className="text-2xl font-black tracking-tight text-[#FF9900]">Ex</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-medium text-[#111]">Checkout ({totalItems} items)</h1>
          <Lock className="w-6 h-6 text-[#555]" />
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-bold text-[#111] mb-4">Your cart is empty</p>
            <Link href="/products" className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-6 py-2 rounded-xl">
              Shop Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Checkout Steps */}
              <div className="w-full lg:flex-1 space-y-6">
                {/* Step 1: Shipping Address */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 bg-[#FF9900]/10 rounded-full flex items-center justify-center font-bold text-[#FF9900]">1</span>
                    <h2 className="text-lg font-bold text-[#111]">Shipping Address</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#555] mb-1">First Name *</label>
                      <input required value={shipping.firstName} onChange={(e) => setShipping({...shipping, firstName: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#555] mb-1">Last Name *</label>
                      <input required value={shipping.lastName} onChange={(e) => setShipping({...shipping, lastName: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#555] mb-1">Email *</label>
                      <input required type="email" value={shipping.email} onChange={(e) => setShipping({...shipping, email: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#555] mb-1">Phone *</label>
                      <input required value={shipping.phone} onChange={(e) => setShipping({...shipping, phone: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-[#555] mb-1">Street Address *</label>
                      <input required value={shipping.street} onChange={(e) => setShipping({...shipping, street: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#555] mb-1">City *</label>
                      <input required value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#555] mb-1">Postal Code *</label>
                      <input required value={shipping.postalCode} onChange={(e) => setShipping({...shipping, postalCode: e.target.value})}
                        className="w-full border border-[#CCC] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment Method */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 bg-[#FF9900]/10 rounded-full flex items-center justify-center font-bold text-[#FF9900]">2</span>
                    <h2 className="text-lg font-bold text-[#111]">Payment Method</h2>
                  </div>
                  <div className="text-sm text-[#333] pl-2 border-l-2 border-[#FF9900]">
                    <div className="flex items-center gap-2 font-bold">
                      <CreditCard className="w-5 h-5 text-[#555]" />
                      Cash on Delivery / Credit Card
                    </div>
                    <p className="text-[#555] mt-1">Payment will be processed securely.</p>
                  </div>
                </div>

                {/* Step 3: Review Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 bg-[#FF9900]/10 rounded-full flex items-center justify-center font-bold text-[#FF9900]">3</span>
                    <h2 className="text-lg font-bold text-[#111]">Review Items</h2>
                  </div>
                  <div className="border border-[#CCC] rounded-xl p-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-[#F7F7F7] rounded-xl flex items-center justify-center border border-[#E5E5E5] flex-shrink-0 overflow-hidden">
                          {item.product.images?.length > 0 ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-3xl">📦</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#111] line-clamp-1">{item.product.name}</p>
                          <p className="text-lg font-black text-[#B12704] mt-0.5">${(item.product.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-[#555]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Place Order Panel */}
              <div className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-8">
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-[0.98] mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Placing order...
                      </>
                    ) : (
                      "Place your order"
                    )}
                  </button>
                  
                  <p className="text-[11px] text-[#555] text-center leading-tight mb-4 border-b border-[#E5E5E5] pb-4">
                    By placing your order, you agree to ShopEx&apos;s privacy notice and conditions of use.
                  </p>

                  <h3 className="font-bold text-[#111] mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm text-[#555] mb-4 border-b border-[#E5E5E5] pb-4">
                    <div className="flex justify-between">
                      <span>Items ({totalItems}):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-[#B12704]">Order total:</span>
                    <span className="font-black text-2xl text-[#B12704]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <footer className="bg-[#F7F7F7] border-t border-[#E5E5E5] py-8 text-center text-xs text-[#555]">
        <div className="max-w-[1000px] mx-auto px-4">
          <p>© 2026 ShopEx Inc.</p>
        </div>
      </footer>
    </div>
  );
}
