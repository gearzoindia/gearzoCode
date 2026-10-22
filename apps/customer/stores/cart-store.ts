import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  pricePaise: number;
  durationMinutes?: number;
  type: 'SERVICE' | 'PRODUCT';
  badge?: string | null;
  requiresProduct?: boolean;
}

interface CartState {
  items: CartItem[];
  selectedServiceMode: 'DOORSTEP' | 'PICKUP_DROP';
  selectedTiming: 'INSTANT' | 'SCHEDULE';
  scheduledDate: string;
  scheduledSlot: string;
  slotInstructions: string;
  couponCode: string;
  discountPaise: number;
  hasOwnProduct: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setServiceMode: (mode: 'DOORSTEP' | 'PICKUP_DROP') => void;
  setTiming: (timing: 'INSTANT' | 'SCHEDULE') => void;
  setSlot: (date: string, slot: string, instructions?: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setHasOwnProduct: (val: boolean) => void;

  getServicesCount: () => number;
  getProductsCount: () => number;
  getItemsTotalPaise: () => number;
  getGstPaise: () => number;
  getFinalTotalPaise: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedServiceMode: 'DOORSTEP',
  selectedTiming: 'INSTANT',
  scheduledDate: 'Today, 14',
  scheduledSlot: '10:00 AM',
  slotInstructions: '',
  couponCode: '',
  discountPaise: 0,
  hasOwnProduct: false,

  addItem: (item: CartItem) => {
    const current = get().items;
    if (!current.some((i) => i.id === item.id)) {
      set({ items: [...current, item] });
    }
  },

  removeItem: (id: string) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  clearCart: () => {
    set({
      items: [],
      discountPaise: 0,
      couponCode: '',
      hasOwnProduct: false,
    });
  },

  setServiceMode: (mode) => set({ selectedServiceMode: mode }),
  setTiming: (timing) => set({ selectedTiming: timing }),
  setSlot: (date, slot, instructions) =>
    set({
      scheduledDate: date,
      scheduledSlot: slot,
      slotInstructions: instructions ?? get().slotInstructions,
    }),

  applyCoupon: (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'GEARZO150' || clean === 'FIRST150') {
      set({ couponCode: clean, discountPaise: 15000 }); // ₹150 OFF
      return true;
    }
    if (clean === 'GEARZO100') {
      set({ couponCode: clean, discountPaise: 10000 }); // ₹100 OFF
      return true;
    }
    return false;
  },

  removeCoupon: () => set({ couponCode: '', discountPaise: 0 }),
  setHasOwnProduct: (val) => set({ hasOwnProduct: val }),

  getServicesCount: () => get().items.filter((i) => i.type === 'SERVICE').length,
  getProductsCount: () => get().items.filter((i) => i.type === 'PRODUCT').length,

  getItemsTotalPaise: () =>
    get().items.reduce((sum, item) => sum + item.pricePaise, 0),

  getGstPaise: () => {
    // 18% GST (tax-inclusive or added as per design Screen 12)
    const subtotal = get().getItemsTotalPaise();
    return Math.round((subtotal * 18) / 118); // embedded 18% GST
  },

  getFinalTotalPaise: () => {
    const subtotal = get().getItemsTotalPaise();
    const discount = get().discountPaise;
    return Math.max(0, subtotal - discount);
  },
}));

