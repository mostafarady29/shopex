"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  MousePointerClick, 
  ShoppingCart,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

const performanceData = [
  { name: "Mon", clicks: 120, conversions: 4 },
  { name: "Tue", clicks: 150, conversions: 5 },
  { name: "Wed", clicks: 180, conversions: 7 },
  { name: "Thu", clicks: 140, conversions: 3 },
  { name: "Fri", clicks: 210, conversions: 10 },
  { name: "Sat", clicks: 250, conversions: 12 },
  { name: "Sun", clicks: 230, conversions: 9 },
];

const topLinks = [
  { id: 1, name: "Sony WH-1000XM5 Review", url: "shopex.co/ref/wh1000", clicks: 450, sales: 12, revenue: 334.80 },
  { id: 2, name: "iPad Air Unboxing YT", url: "shopex.co/ref/ipadair", clicks: 320, sales: 8, revenue: 479.20 },
  { id: 3, name: "Summer Sale Insta", url: "shopex.co/ref/summer26", clicks: 890, sales: 25, revenue: 150.00 },
];

export default function AffiliateDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#111] tracking-tight">Welcome back, Sarah!</h1>
        <p className="text-[#555] mt-1 text-sm">Here's how your links are performing today.</p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#00A650] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="bg-[#E8F8F0] text-[#00A650] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.5%
            </span>
          </div>
          <p className="text-4xl font-black text-[#111] tracking-tight">$964.00</p>
          <p className="text-sm text-[#888] font-medium mt-1">Earnings ({timeRange})</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#111] flex items-center justify-center">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-[#111] tracking-tight">1,280</p>
          <p className="text-sm text-[#888] font-medium mt-1">Link Clicks ({timeRange})</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7EC] text-[#FF9900] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-black text-[#111] tracking-tight">50</p>
          <p className="text-sm text-[#888] font-medium mt-1">Conversions ({timeRange})</p>
        </div>
      </div>

      {/* ── Charts & Tables ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Performance Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-[#111]">Performance Overview</h2>
            <div className="flex bg-[#F5F5F7] p-1 rounded-lg">
              {["7d", "30d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    timeRange === range ? "bg-white text-[#111] shadow-sm" : "text-[#888]"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: '#F5F5F7' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#111', fontWeight: 'bold' }}
                />
                <Bar dataKey="clicks" name="Clicks" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === performanceData.length - 1 ? "#111" : "#E5E5E5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Links */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#111]">Top Performing Links</h2>
            <button className="text-sm font-bold text-[#FF9900] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {topLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 rounded-xl border border-[#E5E5E5] hover:border-[#111] transition-colors group">
                <div>
                  <p className="text-sm font-bold text-[#111]">{link.name}</p>
                  <p className="text-xs text-[#888] font-mono mt-1">{link.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#00A650]">${link.revenue.toFixed(2)}</p>
                  <p className="text-xs text-[#555] mt-1">{link.clicks} clicks • {link.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
