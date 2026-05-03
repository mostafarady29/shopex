"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Headphones, MessageSquare, Check, X, Loader2,
  Search, RefreshCw, ChevronRight, User, Send
} from "lucide-react";
import api from "@/lib/axios";

interface Message {
  id: string;
  body: string;
  isAgent: boolean;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "assigned" | "resolved";
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  messages: Message[];
}

const STATUS_STYLES: Record<string, string> = {
  open:     "bg-[#FFF7EC] text-[#FF9900]",
  assigned: "bg-[#EEF2FF] text-[#4F46E5]",
  resolved: "bg-[#E8F8F0] text-[#00A650]",
};

function TicketDrawer({ ticket, onClose, onUpdated }: {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>(ticket.messages);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/call-center/tickets/${ticket.id}`);
      setMessages(res.data.data.messages);
    } catch {}
  };

  useEffect(() => { fetchMessages(); }, [ticket.id]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/call-center/tickets/${ticket.id}/messages`, { body: reply });
      setMessages(m => [...m, res.data.data]);
      setReply("");
    } catch {}
    finally { setSending(false); }
  };

  const resolve = async () => {
    setResolving(true);
    try {
      await api.put(`/call-center/tickets/${ticket.id}/resolve`);
      onUpdated();
      onClose();
    } catch {} finally { setResolving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-base font-black text-[#111] truncate max-w-[280px]">{ticket.subject}</h2>
            <p className="text-xs text-[#888] mt-0.5">
              {ticket.user.firstName} {ticket.user.lastName} · {ticket.user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ticket.status !== "resolved" && (
              <button onClick={resolve} disabled={resolving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8F0] text-[#00A650] text-xs font-bold rounded-lg hover:bg-[#D0F0E0] transition-colors">
                {resolving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Resolve
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#888]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-[#888] text-center py-8">No messages yet</p>
          ) : messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isAgent ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.isAgent
                  ? "bg-[#FF9900] text-[#111] rounded-tr-sm"
                  : "bg-[#F5F5F7] text-[#111] rounded-tl-sm"
              }`}>
                <p className="text-xs font-bold mb-1 opacity-70">
                  {msg.sender.firstName} · {msg.isAgent ? "Agent" : "Customer"}
                </p>
                <p className="text-sm">{msg.body}</p>
                <p className="text-[10px] mt-1 opacity-50">
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        {ticket.status !== "resolved" ? (
          <div className="p-4 border-t border-[#E5E5E5] flex gap-3">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Type a reply... (Enter to send)"
              rows={2}
              className="flex-1 border border-[#DDD] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
            />
            <button onClick={sendReply} disabled={sending || !reply.trim()}
              className="w-10 h-10 mt-auto rounded-xl bg-[#FF9900] hover:bg-[#E68A00] flex items-center justify-center text-[#111] disabled:opacity-50 transition-colors">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-[#E5E5E5] text-center text-sm text-[#00A650] font-bold bg-[#F0FBF5]">
            ✓ This ticket has been resolved
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportTicketsPage() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState("");
  const [search, setSearch]       = useState("");
  const [active, setActive]       = useState<Ticket | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/call-center/tickets", {
        params: { status: statusFilter || undefined }
      });
      setTickets(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    t.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCount = tickets.filter(t => t.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111] flex items-center gap-2">
            Support Tickets
            {openCount > 0 && (
              <span className="ml-2 bg-[#FF9900] text-[#111] text-xs font-black px-2 py-0.5 rounded-full">
                {openCount} open
              </span>
            )}
          </h1>
          <p className="text-sm text-[#555] mt-1">View and respond to customer support tickets.</p>
        </div>
        <button onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] bg-white shadow-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input type="text" placeholder="Search tickets or customer..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] outline-none transition-all" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          {["", "open", "assigned", "resolved"].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                statusFilter === s
                  ? "bg-[#FF9900] text-[#111]"
                  : "border border-[#E5E5E5] text-[#555] hover:bg-[#F5F5F7]"
              }`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Open",     val: tickets.filter(t => t.status === "open").length,     color: "text-[#FF9900]" },
            { label: "Assigned", val: tickets.filter(t => t.status === "assigned").length, color: "text-[#4F46E5]" },
            { label: "Resolved", val: tickets.filter(t => t.status === "resolved").length, color: "text-[#00A650]" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-sm text-center">
              <p className="text-xs font-bold text-[#888] uppercase tracking-wider">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ticket list */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading tickets...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#888]">
            <Headphones className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No tickets found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {filtered.map(ticket => (
              <div key={ticket.id}
                className="flex items-center justify-between p-5 hover:bg-[#FDFDFD] cursor-pointer transition-colors group"
                onClick={() => setActive(ticket)}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                    {ticket.user.firstName[0]}{ticket.user.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-[#111]">{ticket.subject}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#888] mt-0.5">
                      {ticket.user.firstName} {ticket.user.lastName} · {ticket.user.email}
                    </p>
                    {ticket.messages[0] && (
                      <p className="text-xs text-[#AAA] mt-0.5 truncate max-w-[400px]">
                        {ticket.messages[0].body}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-[#888]">
                      {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    {ticket.assignedTo && (
                      <p className="text-xs text-[#4F46E5] font-medium">
                        → {ticket.assignedTo.firstName}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CCC] group-hover:text-[#FF9900] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <TicketDrawer
          ticket={active}
          onClose={() => setActive(null)}
          onUpdated={fetchTickets}
        />
      )}
    </div>
  );
}
