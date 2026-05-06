import { create } from "zustand";
import api from "@/lib/axios";

type CartProduct = {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  brand: string | null;
};

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
};

type CartStore = {
  items: CartItem[];
  loading: boolean;
  cartCount: number;

  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => Promise<void>;
  resetCart: () => void;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  cartCount: 0,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/cart");
      const items = res.data.cartItems || [];
      const count = items.reduce((s: number, i: CartItem) => s + i.quantity, 0);
      set({ items, cartCount: count });
    } catch {
      set({ items: [], cartCount: 0 });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productId: string, quantity = 1) => {
    try {
      const res = await api.post("/cart", { productId, quantity });
      set({ cartCount: res.data.cartCount });
      // Refetch full cart
      await get().fetchCart();
    } catch (err) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        cartCount: state.items.reduce((s, i) => s + (i.id === itemId ? quantity : i.quantity), 0),
      }));
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  },

  removeItem: async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      set((state) => {
        const newItems = state.items.filter((i) => i.id !== itemId);
        return {
          items: newItems,
          cartCount: newItems.reduce((s, i) => s + i.quantity, 0),
        };
      });
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  },

  clearCart: async () => {
    try {
      await api.delete("/cart");
      set({ items: [], cartCount: 0 });
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  },

  getCartCount: async () => {
    try {
      const res = await api.get("/cart/count");
      set({ cartCount: res.data.count || 0 });
    } catch {
      set({ cartCount: 0 });
    }
  },

  resetCart: () => {
    set({ items: [], cartCount: 0 });
  },
}));
