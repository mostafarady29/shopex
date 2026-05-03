"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Check, X, RefreshCw, Loader2,
  Search, ChevronDown, Package, AlertCircle, Filter
} from "lucide-react";
import api from "@/lib/axios";

interface StockRequest {
  id: string;
  type: "add" | "remove";
  quantity: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  createdAt: string;
  product: { id: string; name: string; stock: number; sku?: string; images: string[] };
  requestedBy: { id: string; firstName: string; lastName: string; email: string };
  reviewedBy?: { firstName: string; lastName: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  pending:  "bg-[#FFF7EC] text-[#FF9900]",
  approved: "bg-[#E8F8F0] text-[#00A650]",
  rejected: "bg-[#FDEDF0] text-[#CC0C39]",
};

function ReviewModal({ request, onClose, onDone }: {
  request: StockRequest;
  onClose: () => void;
  onDone: () => void;
}) {
  const [action, setAction]     = useState<"approve" | "reject">("approve");
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.put(`/stock-checker/admin/requests/${request.id}`, {
        action,
        reviewNote: note || undefined,
      });
      onDone();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <h2 className="text-base font-black text-[#111]">Review Stock Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#888]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary */}
          <div className="bg-[#F9F9F9] rounded-xl p-4 space-y-1 text-sm">
            <p><span className="font-bold text-[#111]">Product:</span> <span className="text-[#555]">{request.product.name}</span></p>
            <p><span className="font-bold text-[#111]">Action:</span>{" "}
              <span className={`font-bold ${request.type === "add" ? "text-[#00A650]" : "text-[#CC0C39]"}`}>
                {request.type === "add" ? "+" : "-"}{request.quantity} units
              </span>
            </p>
            <p><span className="font-bold text-[#111]">Current Stock:</span> <span className="text-[#555]">{request.product.stock}</span></p>
            <p><span className="font-bold text-[#111]">After approval:</span>{" "}
              <span className="font-bold text-[#FF9900]">
                {request.type === "add"
                  ? request.product.stock + request.quantity
                  : Math.max(0, request.product.stock - request.quantity)}
              </span>
            </p>
            <p className="pt-1"><span className="font-bold text-[#111]">Reason:</span> <span className="text-[#555]">{request.reason}</span></p>
            <p><span className="font-bold text-[#111]">Requested by:</span> <span className="text-[#555]">{request.requestedBy.firstName} {request.requestedBy.lastName}</span></p>
          </div>

          {error && (
            <div className="p-3 bg-[#FDEDF0] rounded-xl flex items-center gap-2 text-sm text-[#CC0C39]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#555] mb-2">Decision</label>
            <div className="flex gap-3">
              {(["approve", "reject"] as const).map(a => (
                <label key={a} className="flex-1 cursor-pointer">
                  <input type="radio" name="action" value={a} checked={action === a}
                    onChange={() => setAction(a)} className="peer sr-only" />
                  <div className={`border rounded-xl px-4 py-2.5 text-center text-sm font-bold transition-all peer-checked:border-[#FF9900] ${
                    a === "approve"
                      ? "peer-checked:bg-[#E8F8F0] peer-checked:text-[#00A650] peer-checked:border-[#00A650]"
                      : "peer-checked:bg-[#FDEDF0] peer-checked:text-[#CC0C39] peer-checked:border-[#CC0C39]"
                  } border-[#DDD] text-[#555]`}>
                    {a === "approve" ? "✓ Approve" : "✗ Reject"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#555] mb-1.5">Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Add a review note..."
              className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#DDD] text-[#555] font-bold text-sm py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StockRequestsPage() {
  const [requests, setRequests]     = useState<StockRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatus]   = useState("pending");
  const [search, setSearch]         = useState("");
  const [reviewing, setReviewing]   = useState<StockRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/stock-checker/admin/requests", {
        params: { status: statusFilter || undefined }
      });
      setRequests(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter(r =>
    r.product.name.toLowerCase().includes(search.toLowerCase()) ||
    r.requestedBy.firstName.toLowerCase().includes(search.toLowerCase()) ||
    r.requestedBy.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111] flex items-center gap-2">
            Stock Requests
            {pendingCount > 0 && (
              <span className="ml-2 bg-[#FF9900] text-[#111] text-xs font-black px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-sm text-[#555] mt-1">Review and approve stock change requests from stock checkers.</p>
        </div>
        <button onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] transition-colors bg-white shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input type="text" placeholder="Search product or requester..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] outline-none transition-all" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {["pending", "approved", "rejected", ""].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                statusFilter === s
                  ? "bg-[#FF9900] text-[#111]"
                  : "border border-[#E5E5E5] text-[#555] hover:bg-[#F5F5F7]"
              }`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#888]">
            <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Product</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Change</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Requested By</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Reason</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-[#FDFDFD] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {req.product.images?.[0] ? (
                          <img src={req.product.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-[#F5F5F7]" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#CCC]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#111] max-w-[160px] truncate">{req.product.name}</p>
                          <p className="text-xs text-[#888]">Stock: {req.product.stock}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-sm font-black ${req.type === "add" ? "text-[#00A650]" : "text-[#CC0C39]"}`}>
                        {req.type === "add" ? "+" : "-"}{req.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-[#111]">{req.requestedBy.firstName} {req.requestedBy.lastName}</p>
                      <p className="text-xs text-[#888]">{req.requestedBy.email}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#555] max-w-[160px]">
                      <p className="truncate" title={req.reason}>{req.reason}</p>
                      {req.reviewNote && (
                        <p className="text-xs text-[#888] mt-0.5 italic">Note: {req.reviewNote}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${STATUS_STYLES[req.status]}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#888]">
                      {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {req.status === "pending" ? (
                        <button onClick={() => setReviewing(req)}
                          className="px-3 py-1.5 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] text-xs font-bold rounded-lg transition-colors">
                          Review
                        </button>
                      ) : (
                        <span className="text-xs text-[#888]">
                          {req.reviewedBy ? `By ${req.reviewedBy.firstName}` : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewing && (
        <ReviewModal
          request={reviewing}
          onClose={() => setReviewing(null)}
          onDone={fetchRequests}
        />
      )}
    </div>
  );
}
