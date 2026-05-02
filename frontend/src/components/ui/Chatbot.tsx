"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Sparkles, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string | React.ReactNode;
  timestamp: Date;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  const isAdminContext = pathname.startsWith("/admin");
  const isAffiliateContext = pathname.startsWith("/affiliate");

  // Load chat history from DB when opening chat (logged-in users)
  useEffect(() => {
    if (isOpen && isAuthenticated && !historyLoaded) {
      api.get("/chat/history")
        .then((res) => {
          const dbMessages: Message[] = res.data.data.map((m: any) => ({
            id: m.id,
            sender: m.role === "user" ? "user" : "bot",
            text: m.content,
            timestamp: new Date(m.createdAt),
          }));

          if (dbMessages.length > 0) {
            setMessages(dbMessages);
          } else {
            showGreeting();
          }
          setHistoryLoaded(true);
        })
        .catch(() => {
          showGreeting();
          setHistoryLoaded(true);
        });
    } else if (isOpen && !isAuthenticated && messages.length === 0) {
      showGreeting();
    }
  }, [isOpen, isAuthenticated]);

  const showGreeting = () => {
    setIsTyping(true);
    setTimeout(() => {
      let greeting = "Hi there! How can I help you shop today?";
      let suggestions = [
        "Where is my order?",
        "Recommend headphones",
        "Return policy"
      ];

      if (isAdminContext) {
        greeting = `Welcome back, ${user?.firstName || 'Admin'}. Need quick insights?`;
        suggestions = ["Top product today?", "New affiliate applications", "Revenue this week"];
      } else if (isAffiliateContext) {
        greeting = `Hey ${user?.firstName || 'Partner'}! Ready to boost those conversions?`;
        suggestions = ["How to generate links?", "When is my next payout?", "Marketing tips"];
      }

      setMessages([
        {
          id: Date.now().toString(),
          sender: "bot",
          text: (
            <div>
              <p className="mb-3">{greeting}</p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs text-left bg-white border border-[#E5E5E5] hover:border-[#111] px-3 py-2 rounded-xl transition-all w-fit"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ),
          timestamp: new Date(),
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset history loaded state when user logs in/out
  useEffect(() => {
    setHistoryLoaded(false);
    setMessages([]);
  }, [isAuthenticated]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    if (isAuthenticated) {
      // Authenticated: go through Node.js backend (saves to DB)
      api.post("/chat", { message: text })
        .then((res) => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "bot",
              text: res.data.data.reply,
              timestamp: new Date(),
            }
          ]);
        })
        .catch((err) => {
          console.error(err);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "bot",
              text: "Sorry, there was an error connecting to the AI.",
              timestamp: new Date(),
            }
          ]);
        })
        .finally(() => setIsTyping(false));
    } else {
      // Guest: go through Node.js backend guest endpoint (no DB save)
      fetch("http://localhost:5000/api/chat/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "bot",
              text: data.data.reply,
              timestamp: new Date(),
            }
          ]);
        })
        .catch((err) => {
          console.error(err);
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "bot",
              text: "Sorry, there was an error connecting to the AI.",
              timestamp: new Date(),
            }
          ]);
        })
        .finally(() => setIsTyping(false));
    }
  };

  const handleClearHistory = () => {
    if (!isAuthenticated) {
      setMessages([]);
      showGreeting();
      return;
    }
    api.delete("/chat/history")
      .then(() => {
        setMessages([]);
        setHistoryLoaded(false);
        showGreeting();
      })
      .catch((err) => console.error("Failed to clear history:", err));
  };

  return (
    <>
      {/* ── Toggle Button ──────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 z-50 ${
          isOpen ? "bg-[#111] text-white rotate-90" : "bg-[#111] text-white"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* ── Chat Window ────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E5E5E5] flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#111] p-4 flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#FF9900]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">ShopEx Assistant</h3>
              <p className="text-xs text-[#AAA] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A650]"></span> Online
                {isAuthenticated && <span className="ml-1">• {user?.firstName}</span>}
              </p>
            </div>
            {messages.length > 1 && (
              <button 
                onClick={handleClearHistory}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4 text-[#AAA]" />
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.sender === "user" 
                    ? "bg-[#111] text-white rounded-br-sm" 
                    : "bg-white border border-[#E5E5E5] text-[#111] rounded-bl-sm shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5E5E5] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#CCC] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#CCC] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#CCC] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[#E5E5E5]">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-[#F5F5F7] text-sm py-3 px-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-2 focus:ring-[#FF9900]/20 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-11 h-11 bg-[#FF9900] hover:bg-[#E68A00] disabled:bg-[#F5F5F7] disabled:text-[#CCC] text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
            <p className="text-center text-[10px] text-[#888] mt-3">
              AI can make mistakes. Verify important info.
            </p>
          </div>

        </div>
      )}
    </>
  );
}
