"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Truck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/axios";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const trustBadges = [
  { icon: Truck,        text: "Free Delivery",    sub: "On orders over $35" },
  { icon: RefreshCw,    text: "Easy Returns",     sub: "30-day hassle free" },
  { icon: ShieldCheck,  text: "Secure Payment",   sub: "256-bit encryption" },
  { icon: Star,         text: "Top Rated",        sub: "4.8★ by 50k+ users" },
];

const fadeUp: any = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] as any },
  }),
};

export const Hero = () => {
  const [product, setProduct] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Get high-rated products and pick the best-looking one
        const res = await api.get('/products?sort=rating&limit=10');
        if (res.data.products && res.data.products.length > 0) {
          const bestProduct = res.data.products.find(
            (p: any) => p.images && p.images.length > 0 && p.images[0].startsWith('http') && p.price > 20 && p.price < 1000
          ) || res.data.products[0];
          setProduct(bestProduct);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FAFAFA]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF7EC] via-[#FAFAFA] to-[#FAFAFA] pointer-events-none" />

      <div className="relative mx-auto max-w-[1400px] px-4 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16">

          {/* ── Left: Copy ────────────────────────────── */}
          <div className="flex-1 w-full max-w-xl">
            {/* Pill badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 bg-[#FFF7EC] border border-[#FF9900]/30 text-[#E68A00] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Summer Sale — Up to 60% Off
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-black text-[#111111] leading-[1.08] tracking-tight mb-5"
            >
              Shop Smart.
              <br />
              <span className="text-[#FF9900]">Live Better.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-lg text-[#555555] leading-relaxed mb-8 max-w-md"
            >
              Millions of products. Unbeatable prices. Delivered to your door
              in days — sometimes the same day.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
            >
              <Link href="/products">
                <Button size="lg" variant="primary" className="rounded-full font-bold px-8">
                  Shop Now
                </Button>
              </Link>
              <Link href="/products?sort=discount">
                <Button size="lg" variant="ghost" className="rounded-full gap-2 text-[#555]">
                  See today&apos;s deals <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-wrap items-center gap-4 sm:gap-8 pt-8 border-t border-[#EEEEEE]"
            >
              {[
                { value: "10M+",  label: "Products" },
                { value: "2-Day", label: "Delivery" },
                { value: "50k+",  label: "Happy Customers" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-[#111]">{s.value}</div>
                  <div className="text-xs text-[#888] font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Visual Card Stack ───────────────── */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex-1 w-full max-w-lg"
          >
              {/* Trending product card */}
              <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-[#F0F0F0] p-6 min-h-[350px]">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[#FF9900]" />
                  <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider">
                    Trending Today
                  </span>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : product ? (
                  <>

              {/* Product preview */}
              <Link href={`/products/${product.id}`} className="block">
                <div className="bg-[#F7F7F7] rounded-2xl aspect-video mb-5 flex items-center justify-center overflow-hidden relative group">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="text-8xl select-none group-hover:scale-105 transition-transform">🎧</div>
                  )}
                  {product.comparePrice > product.price && (
                    <span className="absolute top-3 left-3 badge badge-deal">-{Math.round((1 - product.price / product.comparePrice) * 100)}%</span>
                  )}
                  {product.featured && (
                    <span className="absolute top-3 right-3 badge badge-prime">Prime</span>
                  )}
                </div>

                <h3 className="font-bold text-[#111] text-lg mb-1 line-clamp-1 group-hover:text-[#FF9900] transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-[#FF9900]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-current" : "fill-current opacity-25"}`} />
                  ))}
                </div>
                <span className="text-xs text-[#888]">({product.reviewCount || 0})</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-[#111]">${Math.floor(product.price)}</span>
                  {product.comparePrice > product.price && (
                    <span className="text-sm text-[#888] line-through ml-2">${product.comparePrice}</span>
                  )}
                </div>
                <button 
                  onClick={async () => {
                    if (!isAuthenticated) { alert('Please sign in to add items to cart.'); return; }
                    try { await addToCart(product.id); alert('Added to cart!'); } catch { alert('Failed to add to cart.'); }
                  }}
                  className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors active:scale-95"
                >
                  Add to Cart
                </button>
              </div>

              {/* Delivery note */}
              <p className="text-xs text-[#00A650] font-semibold mt-3 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Get it by Tomorrow — order within 4 hrs
              </p>
                  </>
                ) : (
                  <p className="text-sm text-[#888]">No trending products found.</p>
                )}
            </div>

            {/* Floating mini cards */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[{ label: "Smart TV", emoji: "🖥️" }, { label: "Sneakers", emoji: "👟" }, { label: "Coffee", emoji: "☕" }].map((item) => (
                <Link
                  key={item.label}
                  href={`/products?category=${item.label.toLowerCase().replace(' ', '-')}`}
                  className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-3 text-center hover:border-[#FF9900] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <div className="text-[11px] font-semibold text-[#555]">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Trust Badges Strip ─────────────────────────── */}
      <div className="border-t border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-[#FFF7EC] rounded-xl flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-[#FF9900]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111]">{text}</div>
                  <div className="text-xs text-[#888]">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
