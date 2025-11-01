// redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const id = product.id || product.ItemCode;

      if (state.items[id]) {
        state.items[id].quantity += quantity;
      } else {
        state.items[id] = { ...product, quantity };
      }
    },
    incrementQty: (state, action) => {
      const id = action.payload;
      if (state.items[id]) state.items[id].quantity += 1;
    },
    decrementQty: (state, action) => {
      const id = action.payload;
      if (state.items[id]) {
        if (state.items[id].quantity > 1) state.items[id].quantity -= 1;
        else delete state.items[id];
      }
    },
    clearCart: state => {
      state.items = {};
    },
  },
});

export const { addToCart, incrementQty, decrementQty, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
