import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('skyNova_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('skyNova_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    // Add logic to check if item already exists or just add it
    // For flights/packages, we might want unique entries or count
    setCartItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev; // Don't add duplicate for now, or could increment
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
