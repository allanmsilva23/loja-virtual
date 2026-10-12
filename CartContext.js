import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (produto) => {
    setCart((prevCart) => [...prevCart, produto]);
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + Number(item.preco), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);