"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  TrendingUp,
  Zap,
  Brain,
  MapPin,
  ShoppingCart,
  Heart,
  Eye,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

/* ── Mock section definitions (without products) ──────── */
const sectionDefs = [
  { id: "trending", icon: TrendingUp, label: "Trending Near You", color: "#FF9900" },
  { id: "behavior", icon: Brain, label: "Based on Your Browsing", color: "#007185" },
  { id: "value", icon: Zap, label: "Best Value Picks", color: "#00A650" },
];

const categories = [
  { label: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80", href: "/products?category=Electronics" },
  { label: "Men's Clothing", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80", href: "/products?category=Men's Clothing" },
  { label: "Home", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80", href: "/products?category=Home & Kitchen" },
  { label: "Sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80", href: "/products?category=Sports & Outdoors" },
  { label: "Toys", image: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400&q=80", href: "/products?category=Toys & Games" },
  { label: "Jewelry", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", href: "/products?category=Clothing, Shoes & Jewelry" },
];

/* ── Product Card ─────────────────────────────────── */
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  discount: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please sign in to add items to cart.");
      return;
    }
    try {
      await addToCart(product.id.toString());
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert("Failed to add to cart.");
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="product-card bg-white border border-[#F0F0F0] rounded-2xl overflow-hidden">
        {/* Image area */}
        <div className="relative bg-[#F7F7F7] aspect-square flex items-center justify-center overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge === "Prime" && (
              <span className="badge badge-prime">Prime</span>
            )}
            {product.badge === "Deal" && (
              <span className="badge badge-deal">Deal</span>
            )}
            {product.discount >= 30 && !product.badge && (
              <span className="badge badge-new">New Low</span>
            )}
          </div>

          {/* Discount badge */}
          {product.discount > 0 && (
            <div className="absolute top-3 right-3 bg-[#CC0C39] text-white text-xs font-black px-2 py-0.5 rounded-lg">
              -{product.discount}%
            </div>
          )}

          {/* Hover overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
              className={`p-2 rounded-xl transition-all duration-150 ${
                liked ? "bg-[#CC0C39] text-white" : "bg-white shadow-md text-[#555]"
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="p-2 rounded-xl bg-white shadow-md text-[#555] hover:text-[#111] transition-all"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-[#111] line-clamp-2 mb-1.5 group-hover:text-[#FF9900] transition-colors duration-150">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex text-[#FF9900]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-current"
                      : "fill-current opacity-30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#888]">({product.reviews.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-lg font-black text-[#111]">
              ${product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#888] line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            className={`w-full py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              added
                ? "bg-[#00A650] text-white scale-95"
                : "bg-[#FF9900] hover:bg-[#E68A00] text-[#111] active:scale-95"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};

/* ── Section ──────────────────────────────────────── */
const RecommendationSection = ({
  section,
  index,
}: {
  section: any;
  index: number;
}) => {
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="mb-14"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${section.color}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: section.color }} />
          </div>
          <h2 className="text-xl font-black text-[#111]">{section.label}</h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-semibold text-[#007185] hover:text-[#FF9900] transition-colors duration-150"
        >
          See all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {section.products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
};

import api from "@/lib/axios";

/* ── Main Export ──────────────────────────────────── */
export const BentoGrid = () => {
  const [sections, setSections] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products?limit=12");
        const products = res.data.products || [];
        
        // Map DB products to ProductCard shape
        const mappedProducts = products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Math.floor(p.price),
          originalPrice: p.comparePrice > p.price ? Math.floor(p.comparePrice) : Math.floor(p.price),
          rating: p.rating || 4.5,
          reviews: p.reviewCount || 0,
          image: p.images && p.images.length > 0 ? p.images[0] : "📦",
          badge: p.featured ? "Prime" : null,
          discount: p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0,
        }));

        // Split into 3 sections (up to 4 products each)
        const newSections = sectionDefs.map((def, i) => ({
          ...def,
          products: mappedProducts.slice(i * 4, i * 4 + 4),
        })).filter(sec => sec.products.length > 0);

        setSections(newSections);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);
  return (
    <section className="bg-[#F7F7F7] py-12">
      <div className="mx-auto max-w-[1400px] px-4">

        {/* Category quick-links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-sm font-bold text-[#888] uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            Shop by Category
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex-shrink-0 flex flex-col items-center gap-2 bg-white border border-[#F0F0F0] hover:border-[#FF9900] rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <img src={cat.image} alt={cat.label} className="w-12 h-12 object-cover rounded-full group-hover:scale-110 transition-transform duration-200 shadow-sm" />
                <span className="text-xs font-semibold text-[#555] group-hover:text-[#FF9900] transition-colors whitespace-nowrap">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendation sections */}
        {sections.map((section, i) => (
          <RecommendationSection key={section.id} section={section} index={i} />
        ))}
      </div>
    </section>
  );
};
