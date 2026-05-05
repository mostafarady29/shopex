"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ChevronDown, Filter, Star, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
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
  category: string;
  featured: boolean;
  stock: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Avg. Customer Review", value: "rating" },
];



function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [dynamicBrands, setDynamicBrands] = useState<string[]>([]);
  
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const PRICE_RANGES = [
    { label: "Under $25", min: 0, max: 25 },
    { label: "$25 to $50", min: 25, max: 50 },
    { label: "$50 to $100", min: 50, max: 100 },
    { label: "$100 to $200", min: 100, max: 200 },
    { label: "$200 & Above", min: 200, max: undefined },
  ];

  // Filters from URL
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "featured";
  const currentBrands = searchParams.get("brand")?.split(",").filter(Boolean) || [];
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentMinRating = Number(searchParams.get("minRating")) || 0;

  // Local price input state
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Update URL params helper
  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when filters change (unless page itself is being set)
    if (!("page" in updates)) {
      params.set("page", "1");
    }
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get("/products/filters");
        setDynamicCategories(res.data.categories || []);
        setDynamicBrands(res.data.brands || []);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { page: String(currentPage), limit: "12" };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (currentSort !== "featured") params.sort = currentSort;
        if (currentBrands.length > 0) params.brand = currentBrands.join(",");
        if (currentMinPrice) params.minPrice = currentMinPrice;
        if (currentMaxPrice) params.maxPrice = currentMaxPrice;
        if (currentMinRating > 0) params.minRating = String(currentMinRating);

        const res = await api.get("/products", { params });
        const fetchedProducts = res.data.products || [];

        setProducts(fetchedProducts);
        setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentBrands.join(","), currentMinPrice, currentMaxPrice, currentPage, currentMinRating]);

  // Toggle brand filter
  const toggleBrand = (brand: string) => {
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];
    updateFilters({ brand: newBrands.length > 0 ? newBrands.join(",") : undefined });
  };

  // Set price range
  const applyPriceRange = (min?: number, max?: number) => {
    updateFilters({
      minPrice: min !== undefined ? String(min) : undefined,
      maxPrice: max !== undefined ? String(max) : undefined,
    });
  };

  // Custom price Go button
  const handleCustomPrice = () => {
    updateFilters({
      minPrice: minPriceInput || undefined,
      maxPrice: maxPriceInput || undefined,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = currentCategory || currentBrands.length > 0 || currentMinPrice || currentMaxPrice || currentMinRating > 0 || currentSearch;

  const sortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label || "Featured";

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#111]">Active Filters</h3>
            <button onClick={clearAllFilters} className="text-xs text-[#0066c0] hover:text-[#FF9900] hover:underline">
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentCategory && (
              <span className="inline-flex items-center gap-1 bg-[#FFF7EC] border border-[#FF9900]/30 text-[#111] text-xs px-2 py-1 rounded-lg">
                {currentCategory}
                <X className="w-3 h-3 cursor-pointer hover:text-[#CC0C39]" onClick={() => updateFilters({ category: undefined })} />
              </span>
            )}
            {currentBrands.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 bg-[#FFF7EC] border border-[#FF9900]/30 text-[#111] text-xs px-2 py-1 rounded-lg">
                {b}
                <X className="w-3 h-3 cursor-pointer hover:text-[#CC0C39]" onClick={() => toggleBrand(b)} />
              </span>
            ))}
            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 bg-[#FFF7EC] border border-[#FF9900]/30 text-[#111] text-xs px-2 py-1 rounded-lg">
                ${currentMinPrice || "0"} - ${currentMaxPrice || "∞"}
                <X className="w-3 h-3 cursor-pointer hover:text-[#CC0C39]" onClick={() => updateFilters({ minPrice: undefined, maxPrice: undefined })} />
              </span>
            )}
            {currentMinRating > 0 && (
              <span className="inline-flex items-center gap-1 bg-[#FFF7EC] border border-[#FF9900]/30 text-[#111] text-xs px-2 py-1 rounded-lg">
                {currentMinRating}★ & Up
                <X className="w-3 h-3 cursor-pointer hover:text-[#CC0C39]" onClick={() => updateFilters({ minRating: undefined })} />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-bold text-[#111] mb-2">Category</h3>
        <ul className="space-y-1.5 text-sm text-[#333]">
          {dynamicCategories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => updateFilters({ category: currentCategory === cat ? undefined : cat })}
                className={`hover:text-[#FF9900] transition-colors ${currentCategory === cat ? "font-bold text-[#FF9900]" : ""}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-bold text-[#111] mb-2">Featured Brands</h3>
        <ul className="space-y-2 text-sm text-[#333]">
          {dynamicBrands.map((brand) => (
            <li key={brand}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={currentBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 rounded border-[#CCC] text-[#FF9900] focus:ring-[#FF9900] cursor-pointer"
                />
                <span className={`group-hover:text-[#FF9900] transition-colors ${currentBrands.includes(brand) ? "font-bold text-[#111]" : ""}`}>
                  {brand}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Customer Reviews */}
      <div>
        <h3 className="font-bold text-[#111] mb-2">Customer Reviews</h3>
        <ul className="space-y-2 text-sm">
          {[4, 3, 2, 1].map((rating) => (
            <li key={rating}>
              <button
                onClick={() => updateFilters({ minRating: currentMinRating === rating ? undefined : String(rating) })}
                className={`flex items-center gap-1 group ${currentMinRating === rating ? "font-bold" : ""}`}
              >
                <div className="flex text-[#FF9900]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-current" : "text-[#E5E5E5] fill-current"}`} />
                  ))}
                </div>
                <span className={`text-[#0066c0] group-hover:text-[#FF9900] group-hover:underline transition-colors ${currentMinRating === rating ? "text-[#FF9900] font-bold" : ""}`}>
                  & Up
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-bold text-[#111] mb-2">Price</h3>
        <ul className="space-y-1.5 text-sm text-[#333]">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <button
                onClick={() => applyPriceRange(range.min, range.max)}
                className={`hover:text-[#FF9900] transition-colors ${
                  currentMinPrice === String(range.min) && (currentMaxPrice === String(range.max) || (!range.max && !currentMaxPrice))
                    ? "font-bold text-[#FF9900]"
                    : ""
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="number"
            placeholder="$ Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full border border-[#CCC] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FF9900]"
          />
          <input
            type="number"
            placeholder="$ Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full border border-[#CCC] rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FF9900]"
          />
          <button
            onClick={handleCustomPrice}
            className="bg-white border border-[#CCC] hover:bg-[#F7F7F7] text-[#111] px-3 py-1 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <Navbar />

      <div className="bg-white border-b border-[#E5E5E5] text-sm text-[#555] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <p>
            {loading ? (
              "Loading..."
            ) : (
              <>
                {pagination.total > 0 ? (
                  <>
                    {(currentPage - 1) * pagination.limit + 1}-{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
                    {currentSearch && <> for <span className="font-bold text-[#111]">"{currentSearch}"</span></>}
                    {currentCategory && <> in <span className="font-bold text-[#111]">{currentCategory}</span></>}
                  </>
                ) : (
                  <>No results found{currentSearch && <> for <span className="font-bold text-[#111]">"{currentSearch}"</span></>}</>
                )}
              </>
            )}
          </p>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-medium text-[#111]">Sort by:</span>
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-1 bg-[#F7F7F7] border border-[#CCC] rounded-lg px-3 py-1 hover:bg-[#F0F0F0] transition-colors">
                <span className="font-bold text-[#111]">{sortLabel}</span>
                <ChevronDown className="w-4 h-4 text-[#555]" />
              </div>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E5E5E5] rounded-xl shadow-lg hidden group-hover:block z-10 overflow-hidden">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilters({ sort: option.value === "featured" ? undefined : option.value })}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#FFF7EC] hover:text-[#FF9900] transition-colors ${currentSort === option.value ? "font-bold text-[#FF9900]" : "text-[#333]"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="sm:hidden flex items-center gap-1 font-bold text-[#111] bg-[#F7F7F7] border border-[#CCC] rounded-lg px-3 py-1"
          >
            Filters <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-[#111]">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full flex gap-8">
        {/* Left Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterContent />
        </aside>

        {/* Right Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-bold text-[#111] mb-2">No products found</p>
              <p className="text-[#555] mb-4">Try adjusting your filters or search terms.</p>
              <button onClick={clearAllFilters} className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold px-6 py-2 rounded-xl transition-colors">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col">
                  <Link href={`/products/${product.id}`} className="block relative bg-[#F7F7F7] aspect-square flex items-center justify-center group-hover:bg-[#F0F0F0] transition-colors overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4" />
                    ) : (
                      <span className="text-7xl">🎧</span>
                    )}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-3 left-3 bg-[#CC0C39] text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                        Save {Math.round((1 - product.price / product.comparePrice) * 100)}%
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-3 right-3 bg-[#232F3E] text-[#FF9900] text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                        PRIME
                      </div>
                    )}
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <Link href={`/products/${product.id}`} className="font-bold text-[#111] leading-tight line-clamp-2 hover:text-[#FF9900] transition-colors mb-1">
                      {product.name}
                    </Link>
                    {product.brand && (
                      <span className="text-xs text-[#555] mb-1">{product.brand}</span>
                    )}

                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex text-[#FF9900]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-current" : "text-[#E5E5E5] fill-current"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-[#0066c0] hover:text-[#FF9900] hover:underline cursor-pointer">
                        {product.reviewCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-auto pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#111] leading-none">${Math.floor(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-[#555] line-through">List: ${product.comparePrice}</span>
                        )}
                      </div>
                      {product.featured && (
                        <div className="text-xs font-bold text-[#00A8E1] mt-1 flex items-center gap-1">
                          ✓ prime <span className="font-normal text-[#555]">Delivery tomorrow</span>
                        </div>
                      )}

                      <button
                        onClick={async () => {
                          if (!isAuthenticated) { alert('Please sign in to add items to cart.'); return; }
                          try { await addToCart(product.id); alert('Added to cart!'); } catch { alert('Failed to add to cart.'); }
                        }}
                        className="w-full mt-4 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-xl bg-white shadow-sm overflow-hidden p-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateFilters({ page: String(currentPage - 1) })}
                  className={`px-3 py-2 flex items-center gap-1 text-sm font-bold ${currentPage <= 1 ? "text-[#CCC] cursor-not-allowed" : "text-[#111] hover:bg-[#F7F7F7] rounded-lg transition-colors"}`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <div className="flex gap-1 px-2 border-x border-[#E5E5E5]">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilters({ page: String(pageNum) })}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-[#FF9900]/10 border border-[#FF9900] text-[#111] font-bold"
                            : "hover:bg-[#F7F7F7] text-[#111] font-medium"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={currentPage >= pagination.pages}
                  onClick={() => updateFilters({ page: String(currentPage + 1) })}
                  className={`px-3 py-2 flex items-center gap-1 text-sm font-bold ${currentPage >= pagination.pages ? "text-[#CCC] cursor-not-allowed" : "text-[#111] hover:bg-[#F7F7F7] rounded-lg transition-colors"}`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
      <div className="h-16 md:hidden" />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]"><Loader2 className="w-8 h-8 animate-spin text-[#FF9900]" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
