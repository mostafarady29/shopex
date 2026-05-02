"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Eye,
  MoreVertical
} from "lucide-react";

const mockOrders = [
  { id: "ORD-9821", date: "Apr 25, 2026", customer: "John Doe", total: 279.00, status: "Delivered", items: 1 },
  { id: "ORD-9822", date: "Apr 25, 2026", customer: "Alice Smith", total: 1245.50, status: "Processing", items: 3 },
  { id: "ORD-9823", date: "Apr 24, 2026", customer: "Robert Johnson", total: 49.99, status: "Shipped", items: 2 },
  { id: "ORD-9824", date: "Apr 24, 2026", customer: "Emily Davis", total: 899.00, status: "Pending", items: 1 },
];

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-[#E8F8F0] text-[#00A650]";
      case "Shipped": return "bg-[#EBF5FF] text-[#007185]";
      case "Processing": return "bg-[#FFF7EC] text-[#FF9900]";
      default: return "bg-[#F5F5F7] text-[#555]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111]">Orders</h1>
          <p className="text-sm text-[#555] mt-1">Track orders, manage fulfillment, and handle returns.</p>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] hover:text-[#111] transition-colors">
            <Filter className="w-4 h-4" /> Status
          </button>
        </div>
      </div>

      {/* ── Data Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Total</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {mockOrders
                .filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((order) => (
                <tr key={order.id} className="hover:bg-[#FDFDFD] transition-colors group">
                  <td className="py-4 px-6 font-bold text-[#111]">{order.id}</td>
                  <td className="py-4 px-6 text-sm text-[#555]">{order.date}</td>
                  <td className="py-4 px-6 text-sm text-[#111]">{order.customer}</td>
                  <td className="py-4 px-6 text-sm font-bold text-[#111]">${order.total.toFixed(2)} <span className="text-xs text-[#888] font-normal">({order.items} items)</span></td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-[#555] hover:text-[#FF9900] hover:bg-[#FFF7EC] rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#888] hover:text-[#111] hover:bg-[#F5F5F7] rounded-lg transition-colors" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
