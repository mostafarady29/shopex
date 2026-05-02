"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";

interface KPIs {
  totalRevenue: number;
  revenueChange: string;
  revenueTrend: string;
  activeAffiliates: number;
  affiliateChange: string;
  affiliateTrend: string;
  conversionRate: number;
  conversionChange: string;
  conversionTrend: string;
  totalOrders: number;
  orderChange: string;
  orderTrend: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface ChartPoint {
  name: string;
  revenue: number;
}

interface AnalyticsData {
  kpis: KPIs;
  revenueChart: ChartPoint[];
  topProducts: TopProduct[];
}

export default function AdminOverview() {
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/analytics?timeRange=${timeRange}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  const { kpis, revenueChart, topProducts } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111]">Overview</h1>
          <p className="text-sm text-[#555] mt-1">Monitor your platform&apos;s performance and affiliate activity.</p>
        </div>
        <div className="flex bg-white rounded-lg border border-[#E5E5E5] p-1">
          {["24h", "7d", "30d", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                timeRange === range 
                  ? "bg-[#111] text-white" 
                  : "text-[#555] hover:bg-[#F5F5F7] hover:text-[#111]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`$${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={kpis.revenueChange} 
          trend={kpis.revenueTrend} 
          icon={DollarSign} 
        />
        <KPICard 
          title="Active Affiliates" 
          value={kpis.activeAffiliates.toLocaleString()} 
          change={kpis.affiliateChange} 
          trend={kpis.affiliateTrend} 
          icon={Users} 
        />
        <KPICard 
          title="Conversion Rate" 
          value={`${kpis.conversionRate.toFixed(2)}%`}
          change={kpis.conversionChange} 
          trend={kpis.conversionTrend} 
          icon={TrendingUp} 
        />
        <KPICard 
          title="Total Orders" 
          value={kpis.totalOrders.toLocaleString()} 
          change={kpis.orderChange} 
          trend={kpis.orderTrend} 
          icon={ShoppingCart} 
        />
      </div>

      {/* ── Charts & Tables ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#111]">Revenue Analytics</h2>
            <span className="text-xs text-[#888] font-medium uppercase">{timeRange}</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }} 
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#111', fontWeight: 'bold' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#111]">Top Products</h2>
          </div>
          <div className="space-y-5">
            {topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center font-bold text-[#888] text-xs">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111] truncate">{product.name}</p>
                  <p className="text-xs text-[#555]">{product.sales} sales</p>
                </div>
                <div className="text-sm font-bold text-[#111]">
                  ${(product.revenue / 1000).toFixed(1)}k
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#888] text-center py-8">No sales in this period</p>
            )}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl border border-[#E5E5E5] text-sm font-bold text-[#555] hover:bg-[#F5F5F7] hover:text-[#111] transition-colors">
            View All Products
          </button>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, change, trend, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-sm flex flex-col justify-between group hover:border-[#FF9900] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#555] group-hover:bg-[#FFF7EC] group-hover:text-[#FF9900] flex items-center justify-center transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
          trend === 'up' ? 'bg-[#E8F8F0] text-[#00A650]' : 'bg-[#FDEDF0] text-[#CC0C39]'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-[#111] tracking-tight">{value}</p>
        <p className="text-sm text-[#888] font-medium mt-1">{title}</p>
      </div>
    </div>
  );
}
