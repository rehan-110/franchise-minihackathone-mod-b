import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    addToCart: (state, { payload }) => {
      const idx = state.items.findIndex(i => i.id === payload.id);
      if (idx >= 0) state.items[idx].qty += 1;
      else state.items.push({ ...payload, qty: 1 });
      state.total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(i => i.id !== payload);
      state.total = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    },
    clearCart: () => ({ items: [], total: 0 }),
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;