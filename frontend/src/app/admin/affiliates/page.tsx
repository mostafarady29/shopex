"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Percent
} from "lucide-react";

// Mock affiliate data
const mockAffiliates = [
  { id: "AF-1001", name: "Sarah Jenkins", email: "sarah.j@example.com", status: "Active", commission: 15, revenue: 12450, clicks: 4200 },
  { id: "AF-1002", name: "Tech Reviews", email: "contact@techreviews.com", status: "Active", commission: 20, revenue: 45200, clicks: 18500 },
  { id: "AF-1003", name: "Mike's Tech Setup", email: "mike.setup@example.com", status: "Pending", commission: 10, revenue: 0, clicks: 0 },
  { id: "AF-1004", name: "Deal Hunter", email: "deals@hunter.com", status: "Rejected", commission: 10, revenue: 0, clicks: 0 },
  { id: "AF-1005", name: "Lifestyle Blog", email: "hello@lifestyle.com", status: "Active", commission: 12, revenue: 8400, clicks: 3100 },
];

export default function AffiliatesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [affiliates, setAffiliates] = useState(mockAffiliates);

  const handleStatusChange = (id: string, newStatus: string) => {
    setAffiliates(affiliates.map(aff => aff.id === id ? { ...aff, status: newStatus } : aff));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111]">Affiliates</h1>
          <p className="text-sm text-[#555] mt-1">Manage affiliate accounts, approve applications, and set commissions.</p>
        </div>
        <button className="bg-[#111] hover:bg-[#222] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
          Invite Affiliate
        </button>
      </div>

      {/* ── Quick Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-sm">
          <p className="text-sm text-[#888] font-medium mb-1">Total Affiliates</p>
          <p className="text-2xl font-black text-[#111]">{affiliates.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-sm">
          <p className="text-sm text-[#888] font-medium mb-1">Pending Approval</p>
          <p className="text-2xl font-black text-[#FF9900]">
            {affiliates.filter(a => a.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-sm">
          <p className="text-sm text-[#888] font-medium mb-1">Avg. Commission</p>
          <p className="text-2xl font-black text-[#111]">13.4%</p>
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            type="text"
            placeholder="Search affiliates by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] hover:text-[#111] transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* ── Data Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Affiliate</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Commission</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Performance</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {affiliates
                .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-[#FDFDFD] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFF7EC] text-[#FF9900] flex items-center justify-center font-bold text-sm">
                        {affiliate.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111]">{affiliate.name}</p>
                        <p className="text-xs text-[#888]">{affiliate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      affiliate.status === 'Active' ? 'bg-[#E8F8F0] text-[#00A650]' :
                      affiliate.status === 'Pending' ? 'bg-[#FFF7EC] text-[#FF9900]' :
                      'bg-[#FDEDF0] text-[#CC0C39]'
                    }`}>
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 bg-[#F5F5F7] w-fit px-2 py-1 rounded-lg text-sm font-bold text-[#555]">
                      <Percent className="w-3 h-3" />
                      {affiliate.commission}%
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-bold text-[#111]">${affiliate.revenue.toLocaleString()}</p>
                      <p className="text-xs text-[#888] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#FF9900]" /> {affiliate.clicks.toLocaleString()} clicks
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {affiliate.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(affiliate.id, 'Active')}
                            className="p-1.5 text-[#00A650] hover:bg-[#E8F8F0] rounded-lg transition-colors" title="Approve"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(affiliate.id, 'Rejected')}
                            className="p-1.5 text-[#CC0C39] hover:bg-[#FDEDF0] rounded-lg transition-colors" title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-[#888] hover:text-[#111] hover:bg-[#F5F5F7] rounded-lg transition-colors" title="More Options">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {affiliates.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-[#555]">No affiliates found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
