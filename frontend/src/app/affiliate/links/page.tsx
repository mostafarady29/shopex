"use client";

import React, { useState } from "react";
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Download,
  Share2,
  AlertCircle
} from "lucide-react";
import QRCode from "react-qr-code";

export default function AffiliateLinks() {
  const [productUrl, setProductUrl] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const affiliateId = "AF-10492";

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl) return;
    
    // Simulate generation
    const cleanUrl = productUrl.split("?")[0];
    setGeneratedLink(`${cleanUrl}?ref=${affiliateId}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-[#111] tracking-tight">Link Generator</h1>
        <p className="text-[#555] mt-1 text-sm">Create trackable links and QR codes for any ShopEx product.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#111] mb-2">
              Product URL
            </label>
            <div className="relative">
              <LinkIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
              <input
                type="url"
                required
                placeholder="https://shopex.com/products/..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full bg-[#F5F5F7] text-sm py-4 pl-12 pr-4 rounded-2xl border-2 border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-4 focus:ring-[#FF9900]/10 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-[#888] mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Paste the full URL of the product you want to promote.
            </p>
          </div>

          <button 
            type="submit"
            className="bg-[#111] hover:bg-[#222] text-white w-full py-4 rounded-2xl font-bold transition-all transform active:scale-[0.98]"
          >
            Generate Tracking Link
          </button>
        </form>

        {/* ── Results Area ─────────────────────────────────────────── */}
        {generatedLink && (
          <div className="mt-8 pt-8 border-t border-[#E5E5E5] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-sm font-bold text-[#111] mb-4">Your Unique Link</h3>
            
            <div className="flex items-center gap-3 bg-[#F5F5F7] p-2 pr-2 pl-4 rounded-2xl border border-[#E5E5E5]">
              <span className="flex-1 text-sm font-mono text-[#555] truncate">{generatedLink}</span>
              <button 
                onClick={handleCopy}
                className="bg-white hover:bg-[#FFF7EC] text-[#111] hover:text-[#FF9900] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 border border-[#E5E5E5]"
              >
                {copied ? <><Check className="w-4 h-4 text-[#00A650]" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-[#111] mb-4">QR Code</h3>
                <div className="bg-[#F5F5F7] p-6 rounded-2xl border border-[#E5E5E5] w-fit">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <QRCode value={generatedLink} size={150} fgColor="#111111" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#111] mb-4">Quick Actions</h3>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:border-[#111] hover:text-[#111] transition-all">
                  <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Download QR Code</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:border-[#111] hover:text-[#111] transition-all">
                  <span className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Share on Social Media</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
