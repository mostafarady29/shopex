"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar }   from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button }   from "@/components/ui/Button";
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  Package,
  Award,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

/* ── Mock data for reviews (since it's not fully in DB yet) ──────────── */
const mockReviews = [
  { name: "Alex M.", rating: 5, date: "Apr 18, 2026", text: "Absolutely incredible." },
  { name: "Sarah K.", rating: 4, date: "Apr 12, 2026", text: "Sound quality is top notch." },
  { name: "James T.", rating: 5, date: "Apr 2, 2026",  text: "Battery life is insane." },
];

/* ── Stars ─────────────────────────────────────────── */
const Stars = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const s = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex text-[#FF9900]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${s} ${i < Math.floor(rating) ? "fill-current" : "fill-current opacity-25"}`}
        />
      ))}
    </div>
  );
};

/* ── Collapsible Section ────────────────────────────── */
const Collapsible = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#EEEEEE]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-[#111] font-bold text-sm hover:text-[#FF9900] transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main Page ─────────────────────────────────────── */
export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err: any) {
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Check wishlist status
  React.useEffect(() => {
    if (isAuthenticated && id) {
      api.get(`/wishlist/check/${id}`)
        .then((res) => setLiked(res.data.inWishlist))
        .catch(() => {});
    }
  }, [isAuthenticated, id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to add items to cart.");
      return;
    }
    try {
      await addToCart(product.id, qty);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      alert("Failed to add to cart.");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to use the wishlist.");
      return;
    }
    try {
      const res = await api.post("/wishlist", { productId: product.id });
      setLiked(res.data.action === "added");
    } catch {
      alert("Failed to update wishlist.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertTriangle className="w-12 h-12 text-[#CC0C39] mb-4" />
          <h1 className="text-2xl font-black text-[#111] mb-2">Product Not Found</h1>
          <p className="text-[#555] mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Link href="/">
            <Button variant="primary">Return to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  // Map DB fields to UI or use fallbacks
  const images = product.images?.length ? product.images : ["📦"];
  const originalPrice = product.comparePrice || product.price;
  const discount = originalPrice > product.price ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;
  const colors = ["Default"]; // Expand later if DB adds colors

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <div className="bg-white border-b border-[#EEEEEE]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-1.5 text-xs text-[#888] overflow-x-auto">
          {["Home", "Electronics", "Headphones", product.name].map((crumb, i, arr) => (
            <React.Fragment key={crumb}>
              {i < arr.length - 1 ? (
                <>
                  <Link href="#" className="hover:text-[#FF9900] transition-colors whitespace-nowrap">
                    {crumb}
                  </Link>
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                </>
              ) : (
                <span className="text-[#333] font-medium truncate">{crumb}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Product Section ────────────────────────────── */}
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_340px] gap-8">

          {/* ── Gallery ────────────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative bg-white rounded-3xl border border-[#F0F0F0] shadow-sm aspect-square flex items-center justify-center overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="text-[9rem] select-none"
                >
                  {images[activeImage].startsWith("http") ? (
                    <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    images[activeImage]
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFF7EC]"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#555]" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFF7EC]"
                  >
                    <ChevronRight className="w-4 h-4 text-[#555]" />
                  </button>
                </>
              )}

              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-[#CC0C39] text-white text-xs font-black px-2.5 py-1 rounded-lg">
                  -{discount}%
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`w-9 h-9 rounded-xl shadow-sm flex items-center justify-center transition-all ${
                    liked ? "bg-[#CC0C39] text-white" : "bg-white text-[#888] hover:text-[#CC0C39]"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                </button>
                <button
                  className="w-9 h-9 rounded-xl bg-white shadow-sm text-[#888] hover:text-[#111] flex items-center justify-center transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`bg-white border-2 rounded-xl aspect-square flex items-center justify-center text-2xl transition-all overflow-hidden ${
                      activeImage === i
                        ? "border-[#FF9900] shadow-md scale-105"
                        : "border-[#F0F0F0] hover:border-[#DDDDDD]"
                    }`}
                  >
                    {img.startsWith("http") ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      img
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 lg:p-8 space-y-6">
            {/* Brand & badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#007185] hover:underline cursor-pointer">
                {product.brand}
              </span>
              {product.featured && (
                <span className="bg-[#111] text-white text-[10px] font-bold px-2 py-0.5 rounded">Featured</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black text-[#111] leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#EEEEEE]">
              <Stars rating={product.rating} size="md" />
              <span className="text-sm text-[#555] font-semibold">
                {product.rating}
              </span>
              <span className="text-sm text-[#007185] hover:underline cursor-pointer">
                {product.reviewCount || 0} ratings
              </span>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-[#111]">
                  ${product.price}
                </span>
                {originalPrice > product.price && (
                  <>
                    <span className="text-lg text-[#888] line-through">
                      ${originalPrice}
                    </span>
                    <span className="text-sm font-bold text-[#CC0C39]">
                      Save ${originalPrice - product.price} ({discount}%)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#888] mt-1">
                All prices include applicable taxes.
              </p>
            </div>

            {/* Color picker */}
            {colors.length > 1 && (
              <div>
                <p className="text-sm font-bold text-[#111] mb-3">
                  Color: <span className="font-normal text-[#555]">{colors[selectedColor]}</span>
                </p>
                <div className="flex gap-2">
                  {colors.map((color, i) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(i)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedColor === i
                          ? "border-[#FF9900] bg-[#FFF7EC] text-[#111]"
                          : "border-[#EEEEEE] text-[#555] hover:border-[#DDDDDD]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* Description (collapsible) */}
            <Collapsible title="Product Description">
              <p className="text-sm text-[#555] leading-relaxed">{product.description}</p>
            </Collapsible>


          </div>

          {/* ── Buy Box (Sticky) ──────────────────────── */}
          <div className="lg:self-start lg:sticky lg:top-[80px]">
            <div className="bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 space-y-5">
              {/* Price summary */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#111]">${product.price}</span>
                {originalPrice > product.price && (
                  <span className="text-sm text-[#888] line-through">${originalPrice}</span>
                )}
              </div>

              {/* Delivery */}
              <div className="space-y-3 py-4 border-y border-[#EEEEEE]">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-[#00A650] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#00A650]">FREE Delivery</p>
                    <p className="text-xs text-[#555]">
                      <span className="font-semibold text-[#111]">Delivery available</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-[#007185] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#007185]">
                      {product.stock > 0 ? `In Stock — ${product.stock} left` : "Out of Stock"}
                    </p>
                    <p className="text-xs text-[#888]">Order soon</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs font-bold text-[#111] mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border-2 border-[#EEEEEE] flex items-center justify-center text-[#555] hover:border-[#FF9900] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-lg font-black text-[#111] w-6 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-9 h-9 rounded-xl border-2 border-[#EEEEEE] flex items-center justify-center text-[#555] hover:border-[#FF9900] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    addedToCart
                      ? "bg-[#00A650] text-white"
                      : "bg-[#FF9900] hover:bg-[#E68A00] text-[#111] active:scale-95"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart!
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                <button className="w-full py-3.5 rounded-2xl bg-[#111111] hover:bg-[#222] text-white font-bold text-sm transition-colors active:scale-95 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF9900]" />
                  Buy Now
                </button>
              </div>

              {/* Trust indicators */}
              <div className="space-y-2 pt-2">
                {[
                  { icon: ShieldCheck, text: "Secure transaction" },
                  { icon: RefreshCw,   text: "Free 30-day returns" },
                  { icon: Award,       text: "2-year Sony warranty" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-[#555]">
                    <Icon className="w-3.5 h-3.5 text-[#888] flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ──────────────────────────────────── */}
        <div className="mt-10 bg-white rounded-3xl border border-[#F0F0F0] shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#111]">Customer Reviews</h2>
            <Link href="#" className="text-sm font-semibold text-[#007185] hover:text-[#FF9900] flex items-center gap-1 transition-colors">
              See all {product.reviewCount || 0} reviews <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#EEEEEE]">
            <div className="text-center">
              <div className="text-5xl font-black text-[#111]">{product.rating}</div>
              <Stars rating={product.rating} size="md" />
              <div className="text-xs text-[#888] mt-1">out of 5</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 6 : star === 2 ? 2 : 2;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-[#555] w-3">{star}</span>
                    <Star className="w-3 h-3 text-[#FF9900] fill-current flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF9900] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#888] w-8">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReviews.map((review) => (
              <div key={review.name} className="border border-[#F0F0F0] rounded-2xl p-5 hover:border-[#FF9900]/30 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#FF9900] to-[#E68A00] text-white rounded-xl flex items-center justify-center font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#111]">{review.name}</div>
                    <div className="text-xs text-[#888]">{review.date}</div>
                  </div>
                </div>
                <Stars rating={review.rating} />
                <p className="text-sm text-[#555] leading-relaxed mt-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating Mobile Add to Cart ─────────────────── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 p-4 md:hidden bg-white/90 backdrop-blur-sm border-t border-[#EEEEEE] flex items-center gap-3">
        <div>
          <div className="text-lg font-black text-[#111]">${product.price}</div>
          <div className="text-xs text-[#888] line-through">${originalPrice}</div>
        </div>
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            addedToCart
              ? "bg-[#00A650] text-white"
              : "bg-[#FF9900] hover:bg-[#E68A00] text-[#111] active:scale-95"
          }`}
        >
          {addedToCart ? <><Check className="w-4 h-4" /> Added!</> : "Add to Cart"}
        </button>
        <button className="py-3.5 px-5 rounded-2xl bg-[#111] text-white font-bold text-sm flex-shrink-0">
          Buy Now
        </button>
      </div>

      <MobileNav />
      <div className="h-32 md:hidden" />
    </main>
  );
}
