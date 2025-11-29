import { createSlice } from '@reduxjs/toolkit';

// Helper to safely load cart from local storage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cartItems');
    if (!savedCart) return [];
    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (e) {
    console.error("Failed to load cart from storage", e);
    return [];
  }
};

const initialState = {
  cartItems: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const product = action.payload;
      const itemExists = state.cartItems.find(
        (i) => i.product === product._id
      );

      if (itemExists) {
        itemExists.quantity = Math.min(
          itemExists.quantity + 1,
          itemExists.stock
        );
      } else {
        state.cartItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          // Fixed the typo 'httpsIA' -> 'https'
          image: product.images?.[0]?.url || 'https://via.placeholder.com/150',
          stock: product.stock,
          vendor: product.vendor,
          quantity: 1,
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    updateCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.product === productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    removeItemFromCart: (state, action) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(
        (i) => i.product !== productId
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },

    updateCartItemStock: (state, action) => {
      const { productId, stock } = action.payload;
      const item = state.cartItems.find((i) => i.product === productId);
      
      if (item) {
        item.stock = stock;
        if (item.quantity > stock) {
          item.quantity = stock;
        }
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    }
  },
});

export const { 
  addItemToCart, 
  updateCartQuantity, 
  removeItemFromCart, 
  clearCart,
  updateCartItemStock 
} = cartSlice.actions;

export default cartSlice.reducer;