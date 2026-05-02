"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Timer, Zap, Flame, Star, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

type Product = {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  brand: string | null;
  featured: boolean;
};

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 59 });
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Fetch all products with comparePrice (deals)
    api.get("/products", { params: { limit: 20 } })
      .then((res) => {
        const allProducts = res.data.products || [];
        setProducts(allProducts);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Split into flash deals (highest discount) and trending
  const dealsProducts = products
    .filter((p) => p.comparePrice && p.comparePrice > p.price)
    .sort((a, b) => {
      const discA = a.comparePrice ? (1 - a.price / a.comparePrice) : 0;
      const discB = b.comparePrice ? (1 - b.price / b.comparePrice) : 0;
      return discB - discA;
    });

  const flashDeals = dealsProducts.slice(0, 4);
  const trendingDeals = dealsProducts.slice(4);

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      alert("Please sign in to add items to cart.");
      return;
    }
    try {
      await addToCart(productId);
      alert("Added to cart!");
    } catch {
      alert("Failed to add to cart.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      {/* Deals Header Banner */}
      <div className="bg-gradient-to-r from-[#CC0C39] to-[#FF9900] text-white py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-2">
              <Flame className="w-8 h-8 text-yellow-300" /> Today&apos;s Deals
            </h1>
            <p className="text-white/90 text-sm sm:text-base max-w-2xl">
              New deals. Every day. Shop our Deal of the Day, Lightning Deals, and more daily deals and limited-time sales.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <Timer className="w-6 h-6 text-yellow-300" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-300 mb-0.5">Ends in</p>
              <div className="flex gap-2 text-xl font-black tabular-nums">
                <span className="bg-black/40 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span className="bg-black/40 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span className="bg-black/40 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-12">
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
          </div>
        ) : dealsProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold text-[#111] mb-2">No deals available right now</p>
            <p className="text-[#555] mb-4">Check back later for amazing deals!</p>
            <Link href="/products" className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-6 py-2 rounded-xl transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Flash Deals / Lightning Deals */}
            {flashDeals.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-6 h-6 text-[#CC0C39]" fill="currentColor" />
                  <h2 className="text-2xl font-black text-[#111]">Lightning Deals</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {flashDeals.map((deal) => {
                    const discount = deal.comparePrice ? Math.round((1 - deal.price / deal.comparePrice) * 100) : 0;
                    const claimed = Math.floor(Math.random() * 40) + 55; // Simulated progress
                    return (
                      <div key={deal.id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col">
                        <Link href={`/products/${deal.id}`} className="block relative bg-[#F7F7F7] aspect-square flex items-center justify-center group-hover:bg-[#F0F0F0] transition-colors overflow-hidden">
                          {deal.images && deal.images.length > 0 ? (
                            <img src={deal.images[0]} alt={deal.name} className="w-full h-full object-contain p-4" />
                          ) : (
                            <span className="text-8xl">🎁</span>
                          )}
                          <div className="absolute top-3 left-3 bg-[#CC0C39] text-white text-xs font-black px-2 py-1 rounded-md shadow-sm">
                            Up to {discount}% off
                          </div>
                        </Link>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] font-bold text-[#555] uppercase mb-1">
                              <span>{claimed}% Claimed</span>
                              <span className="text-[#CC0C39]">Ends soon!</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                              <div className="h-full bg-[#CC0C39]" style={{ width: `${claimed}%` }} />
                            </div>
                          </div>

                          <Link href={`/products/${deal.id}`} className="font-bold text-[#111] leading-tight line-clamp-2 hover:text-[#FF9900] transition-colors mb-2">
                            {deal.name}
                          </Link>

                          <div className="mt-auto pt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-[#B12704] leading-none">${Math.floor(deal.price)}</span>
                              <span className="text-sm text-[#555] line-through">${deal.comparePrice}</span>
                            </div>
                            
                            <button
                              onClick={() => handleAddToCart(deal.id)}
                              className="w-full mt-4 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trending Deals */}
            {trendingDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-[#111] mb-6">Trending Deals</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {trendingDeals.map((deal) => {
                    const discount = deal.comparePrice ? Math.round((1 - deal.price / deal.comparePrice) * 100) : 0;
                    return (
                      <Link key={deal.id} href={`/products/${deal.id}`} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 hover:shadow-md transition-shadow group">
                        <div className="aspect-square bg-[#F7F7F7] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F0F0F0] transition-colors overflow-hidden">
                          {deal.images && deal.images.length > 0 ? (
                            <img src={deal.images[0]} alt={deal.name} className="w-full h-full object-contain p-2" />
                          ) : (
                            <span className="text-6xl">🎁</span>
                          )}
                        </div>
                        <div className="inline-block bg-[#CC0C39] text-white text-xs font-bold px-2 py-0.5 rounded mb-2">
                          {discount}% off
                        </div>
                        <span className="text-xs font-bold text-[#CC0C39] ml-2">Deal</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-black text-[#111]">${deal.price}</span>
                          <span className="text-xs text-[#555] line-through">List: ${deal.comparePrice}</span>
                        </div>
                        <p className="text-sm text-[#111] line-clamp-2 mt-2 leading-snug">{deal.name}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

      </main>

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
