"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Star, Trash2, ShoppingCart, Loader2, Heart } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/axios";

type WishlistProduct = {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  brand: string | null;
  stock: number;
};

type WishlistEntry = {
  id: string;
  product: WishlistProduct;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/wishlist")
        .then((res) => setItems(res.data.items || []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const removeItem = async (id: string) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to remove:", err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      alert("Added to cart!");
    } catch {
      alert("Please sign in to add items to cart.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-[#111] tracking-tight">
            Your Wishlist
          </h1>
          <span className="text-[#555] font-medium">{items.length} items</span>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">Sign in to view your wishlist</h2>
            <p className="text-[#555] mb-8">
              Sign in to save items you love and come back to them later.
            </p>
            <Link
              href="/auth/login"
              className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">Your wishlist is empty</h2>
            <p className="text-[#555] mb-8">
              Save items you want to buy later by clicking the heart icon on any product page.
            </p>
            <Link
              href="/products"
              className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-8 py-3 rounded-xl transition-colors inline-flex"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((entry) => (
              <div key={entry.id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col relative">
                <button
                  onClick={() => removeItem(entry.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#555] hover:text-[#CC0C39] hover:bg-white shadow-sm transition-all"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/products/${entry.product.id}`} className="block relative bg-[#F7F7F7] aspect-square flex items-center justify-center group-hover:bg-[#F0F0F0] transition-colors overflow-hidden">
                  {entry.product.images && entry.product.images.length > 0 ? (
                    <img src={entry.product.images[0]} alt={entry.product.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <span className="text-7xl">📦</span>
                  )}
                  {entry.product.comparePrice && entry.product.comparePrice > entry.product.price && (
                    <div className="absolute top-3 left-3 bg-[#CC0C39] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                      Save {Math.round((1 - entry.product.price / entry.product.comparePrice) * 100)}%
                    </div>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/products/${entry.product.id}`} className="font-bold text-[#111] leading-tight line-clamp-2 hover:text-[#FF9900] transition-colors mb-1">
                    {entry.product.name}
                  </Link>
                  {entry.product.brand && (
                    <span className="text-xs text-[#555] mb-1">{entry.product.brand}</span>
                  )}

                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex text-[#FF9900]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(entry.product.rating) ? "fill-current" : "text-[#E5E5E5] fill-current"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-[#0066c0]">{entry.product.reviewCount.toLocaleString()}</span>
                  </div>

                  <div className="mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#111] leading-none">${Math.floor(entry.product.price)}</span>
                      {entry.product.comparePrice && entry.product.comparePrice > entry.product.price && (
                        <span className="text-sm text-[#555] line-through">${entry.product.comparePrice}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(entry.product.id)}
                      className="w-full mt-4 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}
