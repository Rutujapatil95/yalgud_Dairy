// src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existing = state.items.find(i => i.ItemCode === newItem.ItemCode);
      if (existing) {
        existing.Qty += newItem.Qty || 1;
      } else {
        state.items.push({ ...newItem, Qty: newItem.Qty || 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.ItemCode !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { ItemCode, Qty } = action.payload;
      const existing = state.items.find(i => i.ItemCode === ItemCode);
      if (existing && Qty > 0) existing.Qty = Qty;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
