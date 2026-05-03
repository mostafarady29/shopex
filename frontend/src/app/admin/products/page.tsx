"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, Package, X,
  Loader2, AlertCircle, Check, RefreshCw, ChevronDown
} from "lucide-react";
import api from "@/lib/axios";

interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  status: string;
  featured: boolean;
  images: string[];
  commissionRate?: number;
}

const STATUS_COLORS: Record<string, string> = {
  active:       "bg-[#E8F8F0] text-[#00A650]",
  inactive:     "bg-[#F5F5F7] text-[#888]",
  "out-of-stock": "bg-[#FDEDF0] text-[#CC0C39]",
};

// ─── Product Modal ─────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSaved }: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name:           product?.name           || "",
    description:    "",
    category:       product?.category       || "",
    brand:          product?.brand          || "",
    price:          product?.price?.toString()          || "",
    comparePrice:   product?.comparePrice?.toString()   || "",
    sku:            product?.sku            || "",
    stock:          product?.stock?.toString()          || "0",
    status:         product?.status         || "active",
    commissionRate: product?.commissionRate?.toString() || "",
    images:         product?.images?.join(", ")         || "",
    featured:       product?.featured ? "true" : "false",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.category || !form.price) {
      setError("Name, category and price are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        images:   form.images.split(",").map(s => s.trim()).filter(Boolean),
        featured: form.featured === "true",
      };
      if (isEdit) {
        await api.put(`/products/${product!.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 700);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-bold text-[#555] mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inp = "w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-black text-[#111]">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#888]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-[#FDEDF0] border border-[#FABCCA] rounded-xl flex items-center gap-2 text-sm text-[#CC0C39]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-[#E8F8F0] border border-[#A3DEC0] rounded-xl flex items-center gap-2 text-sm text-[#00A650]">
              <Check className="w-4 h-4 flex-shrink-0" /> Saved!
            </div>
          )}

          <Field label="Product Name *">
            <input value={form.name} onChange={set("name")} required className={inp} placeholder="e.g. Sony WH-1000XM5" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category *">
              <input value={form.category} onChange={set("category")} required className={inp} placeholder="Electronics" />
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={set("brand")} className={inp} placeholder="Sony" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($) *">
              <input type="number" step="0.01" min="0" value={form.price} onChange={set("price")} required className={inp} placeholder="99.99" />
            </Field>
            <Field label="Compare Price ($)">
              <input type="number" step="0.01" min="0" value={form.comparePrice} onChange={set("comparePrice")} className={inp} placeholder="129.99" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock Quantity">
              <input type="number" min="0" value={form.stock} onChange={set("stock")} className={inp} placeholder="0" />
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={set("sku")} className={inp} placeholder="SKU-001" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <div className="relative">
                <select value={form.status} onChange={set("status")} className={`${inp} appearance-none pr-8`}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
              </div>
            </Field>
            <Field label="Commission Rate (%)">
              <input type="number" step="0.1" min="0" max="100" value={form.commissionRate} onChange={set("commissionRate")} className={inp} placeholder="10" />
            </Field>
          </div>

          <Field label="Featured">
            <div className="relative">
              <select value={form.featured} onChange={set("featured")} className={`${inp} appearance-none pr-8`}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
            </div>
          </Field>

          <Field label="Image URLs (comma-separated)">
            <textarea value={form.images} onChange={set("images") as any}
              rows={2}
              className={`${inp} resize-none`}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#DDD] text-[#555] font-bold text-sm py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || success}
              className="flex-1 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : null}
              {loading ? "Saving..." : success ? "Saved!" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────
function DeleteConfirm({ product, onClose, onDeleted }: {
  product: Product;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/products/${product.id}`);
      onDeleted();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FDEDF0] flex items-center justify-center mx-auto">
          <Trash2 className="w-5 h-5 text-[#CC0C39]" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-black text-[#111] mb-1">Delete Product</h3>
          <p className="text-sm text-[#555]">Delete <strong>{product.name}</strong>? This cannot be undone.</p>
        </div>
        {error && <p className="text-xs text-[#CC0C39] text-center">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-[#DDD] text-[#555] font-bold text-sm py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 bg-[#CC0C39] hover:bg-[#A50930] text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ProductManagement() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search)       params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/products/admin/all", { params });
      setProducts(res.data.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const stockColor = (stock: number) => {
    if (stock === 0) return "text-[#CC0C39] font-bold";
    if (stock < 10)  return "text-[#FF9900] font-bold";
    return "text-[#111] font-bold";
  };

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111]">Products</h1>
          <p className="text-sm text-[#555] mt-1">Manage inventory, pricing, and product visibility.</p>
        </div>
        <button
          onClick={() => setModalProduct("new")}
          className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stock alerts */}
      {!loading && (outOfStockCount > 0 || lowStockCount > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-3 bg-[#FDEDF0] border border-[#FABCCA] rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 text-[#CC0C39] flex-shrink-0" />
              <span className="font-bold text-[#CC0C39]">{outOfStockCount} product{outOfStockCount > 1 ? "s" : ""} out of stock</span>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-3 bg-[#FFF7EC] border border-[#FFD580] rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 text-[#FF9900] flex-shrink-0" />
              <span className="font-bold text-[#FF9900]">{lowStockCount} product{lowStockCount > 1 ? "s" : ""} low on stock (&lt;10)</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input type="text" placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none transition-all" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#F5F5F7] border border-transparent text-sm font-medium text-[#555] px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#FF9900] transition-all">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
          </div>
          <button onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#888]">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No products found</p>
          </div>
        ) : (
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
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-[#FDFDFD] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover bg-[#F5F5F7]"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#CCC]">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#111] max-w-[200px] truncate">{product.name}</p>
                          <p className="text-xs text-[#888]">{product.sku || product.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#555]">{product.category}</td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-[#111]">${product.price.toFixed(2)}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-[#888] line-through">${product.comparePrice.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${stockColor(product.stock)}`}>{product.stock}</span>
                        {product.stock === 0 && (
                          <span className="text-[10px] font-bold bg-[#FDEDF0] text-[#CC0C39] px-1.5 py-0.5 rounded">OUT</span>
                        )}
                        {product.stock > 0 && product.stock < 10 && (
                          <span className="text-[10px] font-bold bg-[#FFF7EC] text-[#FF9900] px-1.5 py-0.5 rounded">LOW</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${STATUS_COLORS[product.status] || "bg-[#F5F5F7] text-[#888]"}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModalProduct(product)}
                          className="p-1.5 text-[#555] hover:text-[#FF9900] hover:bg-[#FFF7EC] rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteProduct(product)}
                          className="p-1.5 text-[#555] hover:text-[#CC0C39] hover:bg-[#FDEDF0] rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalProduct === "new" || (modalProduct && typeof modalProduct === "object")) && (
        <ProductModal
          product={modalProduct === "new" ? null : modalProduct as Product}
          onClose={() => setModalProduct(null)}
          onSaved={fetchProducts}
        />
      )}
      {deleteProduct && (
        <DeleteConfirm
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onDeleted={fetchProducts}
        />
      )}
    </div>
  );
}
