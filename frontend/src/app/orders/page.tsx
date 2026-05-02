"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Search, Package, RefreshCcw, Loader2, ShoppingBag, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/axios";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    images: string[];
    brand: string | null;
  };
};

type Order = {
  id: string;
  orderId: string;
  createdAt: string;
  total: number;
  status: string;
  shipFirstName: string;
  shipLastName: string;
  deliveryDate: string | null;
  items: OrderItem[];
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "text-[#FF9900]", label: "Processing" },
  processing: { color: "text-[#FF9900]", label: "Processing" },
  shipped: { color: "text-[#0066c0]", label: "Shipped" },
  delivered: { color: "text-[#00A650]", label: "Delivered" },
  cancelled: { color: "text-[#CC0C39]", label: "Cancelled" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/orders/my")
        .then((res) => setOrders(res.data.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchQuery
      ? order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    if (activeTab === "not-shipped") return order.status === "pending" || order.status === "processing";
    if (activeTab === "cancelled") return order.status === "cancelled";
    if (activeTab === "buy-again") return order.status === "delivered";
    return matchesSearch;
  });

  const handleBuyAgain = async (productId: string) => {
    try {
      await addToCart(productId);
      alert("Added to cart!");
    } catch {
      alert("Failed to add to cart.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-black text-[#111] tracking-tight">
            Your Orders
          </h1>
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#888]" />
            </div>
            <input
              type="text"
              placeholder="Search all orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[#CCC] rounded-xl text-sm placeholder-[#AAA] focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E5E5E5] mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide">
            {[
              { id: "orders", label: "Orders" },
              { id: "buy-again", label: "Buy Again" },
              { id: "not-shipped", label: "Not Yet Shipped" },
              { id: "cancelled", label: "Cancelled Orders" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#FF9900] text-[#111]"
                    : "border-transparent text-[#555] hover:text-[#FF9900] hover:border-[#FF9900]/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-12 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">Sign in to view your orders</h2>
            <p className="text-[#555] mb-8">Track your orders and manage your purchases.</p>
            <Link href="/auth/login" className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex">
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-12 text-center">
            <div className="text-6xl mb-6"><ShoppingBag className="w-16 h-16 text-[#CCC] mx-auto" /></div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">No orders found</h2>
            <p className="text-[#555] mb-8">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-[#F9F9F9] border-b border-[#E5E5E5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-[#555] font-medium mb-0.5">Order Placed</p>
                        <p className="text-[#111] font-bold">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[#555] font-medium mb-0.5">Total</p>
                        <p className="text-[#111] font-bold">${order.total.toFixed(2)}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-[#555] font-medium mb-0.5">Ship To</p>
                        <p className="text-[#0066c0] font-bold">
                          {order.shipFirstName} {order.shipLastName}
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[#555] font-medium mb-0.5">Order # {order.orderId}</p>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <h3 className={`font-black text-lg mb-4 ${status.color}`}>
                      {status.label}
                      {order.deliveryDate && ` — ${formatDate(order.deliveryDate)}`}
                    </h3>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-20 h-20 bg-[#F7F7F7] rounded-xl flex items-center justify-center border border-[#E5E5E5] flex-shrink-0 overflow-hidden">
                            {item.product?.images && item.product.images.length > 0 ? (
                              <img src={item.product.images[0]} alt={item.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Package className="w-8 h-8 text-[#CCC]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Link href={`/products/${item.product?.id || '#'}`} className="font-bold text-[#111] hover:text-[#FF9900] transition-colors leading-snug line-clamp-2 mb-1">
                              {item.name}
                            </Link>
                            <p className="text-xs text-[#555]">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <button
                                onClick={() => handleBuyAgain(item.product?.id)}
                                className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" /> Buy again
                              </button>
                              <Link
                                href={`/products/${item.product?.id || '#'}`}
                                className="bg-white hover:bg-[#F7F7F7] border border-[#CCC] text-[#111] font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm active:scale-95"
                              >
                                View item
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
