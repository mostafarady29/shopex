"use client";

import React from "react";
import { Download, FileText, Image, Video, ExternalLink, Zap } from "lucide-react";

const resources = [
  {
    title: "Brand Kit & Logos",
    desc: "Official ShopEx logos, badges, and brand assets in PNG, SVG, and AI formats.",
    icon: Image,
    type: "ZIP",
    size: "12.4 MB",
  },
  {
    title: "Product Banners",
    desc: "Pre-made banners in multiple sizes for social media, email headers, and websites.",
    icon: Image,
    type: "ZIP",
    size: "28.1 MB",
  },
  {
    title: "Email Templates",
    desc: "High-converting email templates for product promotions and seasonal campaigns.",
    icon: FileText,
    type: "HTML",
    size: "2.1 MB",
  },
  {
    title: "Video Ads",
    desc: "Short-form video creatives optimized for TikTok, Reels, and YouTube Shorts.",
    icon: Video,
    type: "MP4",
    size: "156 MB",
  },
  {
    title: "Affiliate Guidebook",
    desc: "Complete guide on best practices, commission tiers, and optimization strategies.",
    icon: FileText,
    type: "PDF",
    size: "4.8 MB",
  },
];

export default function AffiliateResources() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#111] tracking-tight">Resources</h1>
        <p className="text-[#555] mt-1 text-sm">
          Download marketing assets, templates, and guides to boost your affiliate performance.
        </p>
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-[#111] to-[#222] text-white rounded-3xl p-8 flex items-start gap-4">
        <div className="w-10 h-10 bg-[#FF9900]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-[#FF9900]" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">Pro Tip</h3>
          <p className="text-sm text-[#AAA] leading-relaxed">
            Affiliates who use our pre-made banners see 2.4x higher click-through rates compared to custom creatives. 
            Download the banner pack and start promoting today!
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res) => (
          <div
            key={res.title}
            className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md hover:border-[#FF9900]/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFF7EC] transition-colors">
                <res.icon className="w-5 h-5 text-[#888] group-hover:text-[#FF9900] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#111] mb-1">{res.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed mb-3">{res.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888]">
                    {res.type} • {res.size}
                  </span>
                  <button className="flex items-center gap-1.5 text-sm font-bold text-[#FF9900] hover:text-[#E68A00] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Docs link */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#111] mb-1">Developer API</h3>
          <p className="text-sm text-[#555]">Integrate ShopEx affiliate tracking into your own apps and tools.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white font-bold text-sm rounded-xl hover:bg-[#222] transition-colors">
          <ExternalLink className="w-4 h-4" />
          View Docs
        </button>
      </div>
    </div>
  );
}
