"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus,
  Package,
  Edit2,
  Trash2
} from "lucide-react";

const mockProducts = [
  { id: "PRD-001", name: "Sony WH-1000XM5 Headphones", category: "Electronics", price: 279.00, stock: 12, status: "Active" },
  { id: "PRD-002", name: "Apple iPad Air (5th Gen)", category: "Electronics", price: 599.00, stock: 45, status: "Active" },
  { id: "PRD-003", name: "Logitech MX Master 3S", category: "Electronics", price: 99.00, stock: 0, status: "Out of Stock" },
  { id: "PRD-004", name: "Ergonomic Office Chair", category: "Furniture", price: 199.99, stock: 8, status: "Active" },
  { id: "PRD-005", name: "Stainless Steel Water Bottle", category: "Home & Garden", price: 24.50, stock: 120, status: "Active" },
];

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111]">Products</h1>
          <p className="text-sm text-[#555] mt-1">Manage your inventory, pricing, and product visibility.</p>
        </div>
        <button className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] hover:text-[#111] transition-colors">
            <Filter className="w-4 h-4" /> Category
          </button>
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
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Product</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Price</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Stock</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {mockProducts
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((product) => (
                <tr key={product.id} className="hover:bg-[#FDFDFD] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#888] flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111]">{product.name}</p>
                        <p className="text-xs text-[#888]">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-[#555]">{product.category}</td>
                  <td className="py-4 px-6 text-sm font-bold text-[#111]">${product.price.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-bold ${product.stock > 0 ? "text-[#111]" : "text-[#CC0C39]"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      product.status === 'Active' ? 'bg-[#E8F8F0] text-[#00A650]' : 'bg-[#FDEDF0] text-[#CC0C39]'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-[#555] hover:text-[#FF9900] hover:bg-[#FFF7EC] rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#555] hover:text-[#CC0C39] hover:bg-[#FDEDF0] rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
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
