"use client";

import React, { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const paymentHistory = [
  { id: "PAY-9012", date: "Apr 15, 2026", amount: 1250.00, status: "Paid", method: "PayPal (***@example.com)" },
  { id: "PAY-8432", date: "Mar 15, 2026", amount: 890.50, status: "Paid", method: "Bank Transfer (****1234)" },
  { id: "PAY-7651", date: "Feb 15, 2026", amount: 1105.20, status: "Paid", method: "PayPal (***@example.com)" },
  { id: "PAY-6542", date: "Jan 15, 2026", amount: 450.00, status: "Paid", method: "PayPal (***@example.com)" },
];

export default function AffiliateWallet() {
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#111] tracking-tight">Wallet & Payouts</h1>
        <p className="text-[#555] mt-1 text-sm">Manage your earnings, payment methods, and withdrawal history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Balance Card ─────────────────────────────────────── */}
        <div className="md:col-span-2 bg-[#111] text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF9900]/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end h-full gap-6">
            <div>
              <p className="text-[#888] font-medium mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Available Balance
              </p>
              <h2 className="text-5xl font-black tracking-tight">$428.50</h2>
              <p className="text-sm text-[#888] mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Minimum payout is $50.00
              </p>
            </div>
            
            <button 
              onClick={handleWithdraw}
              disabled={withdrawing || success}
              className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center min-w-[200px] ${
                success 
                  ? "bg-[#00A650] text-white" 
                  : withdrawing 
                    ? "bg-[#333] text-[#888] cursor-not-allowed" 
                    : "bg-[#FF9900] hover:bg-[#E68A00] text-[#111] transform active:scale-95"
              }`}
            >
              {success ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Request Sent</span>
              ) : withdrawing ? (
                <div className="w-5 h-5 border-2 border-[#888] border-t-[#FFF] rounded-full animate-spin"></div>
              ) : (
                "Withdraw Funds"
              )}
            </button>
          </div>
        </div>

        {/* ── Next Payout ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 shadow-sm flex flex-col justify-center">
          <p className="text-[#555] font-medium mb-2 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" /> Next scheduled payout
          </p>
          <p className="text-2xl font-black text-[#111]">May 15, 2026</p>
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <p className="text-sm font-bold text-[#111] mb-1">Payment Method</p>
            <p className="text-sm text-[#555]">PayPal (***@example.com)</p>
            <button className="text-sm font-bold text-[#FF9900] mt-2 hover:underline">Change Method</button>
          </div>
        </div>
      </div>

      {/* ── Payment History ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-bold text-[#111]">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Transaction ID</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Method</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#FDFDFD] transition-colors">
                  <td className="py-4 px-6 text-sm text-[#111] font-medium">{payment.date}</td>
                  <td className="py-4 px-6 text-sm text-[#555] font-mono">{payment.id}</td>
                  <td className="py-4 px-6 text-sm text-[#555]">{payment.method}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#E8F8F0] text-[#00A650]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-black text-[#111] text-right">${payment.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
