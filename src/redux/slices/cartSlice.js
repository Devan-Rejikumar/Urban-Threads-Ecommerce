import { createSlice } from "@reduxjs/toolkit";
const cartSlice = createSlice({
    name: 'cart',
    initialState: {
      items: [],
      totalAmount: 0,
      totalQuantity: 0
    },
    reducers: {
      addToCart: (state, action) => {
        const newItem = action.payload;
        const existingItem = state.items.find(
            item => item.productId === newItem.productId && 
                    item.selectedSize === newItem.selectedSize
        );
        
        if (existingItem) {
            existingItem.quantity = Math.min(
                existingItem.quantity + newItem.quantity,
                existingItem.maxPerPerson,
                existingItem.stock
            );
        } else {
            state.items.push({
                ...newItem,
                quantity: Math.min(newItem.quantity, newItem.maxPerPerson, newItem.stock)
            });
        }
    
        // Recalculate totals
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
      updateQuantity: (state, action) => {
        const { productId, selectedSize, quantity } = action.payload;
        const item = state.items.find(
          item => item.productId === productId && item.selectedSize === selectedSize
        );
        if (item) {
          item.quantity = quantity;
        }
   
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      removeFromCart: (state, action) => {
        const { productId, selectedSize } = action.payload;
        state.items = state.items.filter(
          item => !(item.productId === productId && item.selectedSize === selectedSize)
        );
     
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      setCart : (state, action) => {
        state.items = action.payload;
        state.totalQuantity = state.items.reduce((total,item) => total + item.quantity,0)
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }
  });
  

  export const { addToCart, updateQuantity, removeFromCart, setCart } = cartSlice.actions;
  export default cartSlice.reducer;