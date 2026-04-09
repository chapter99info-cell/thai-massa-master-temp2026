import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Service, Therapist } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (service: Service, price: number, therapist?: Therapist) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  showUpsell: boolean;
  setShowUpsell: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showUpsell, setShowUpsell] = useState(false);

  const addToCart = (service: Service, price: number, therapist?: Therapist) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === service.id && item.therapist?.id === therapist?.id);
      
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = { 
          ...newCart[existingIndex], 
          quantity: newCart[existingIndex].quantity + 1 
        };
        return newCart;
      }
      
      return [...prev, { ...service, quantity: 1, selectedPrice: price, therapist }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.id !== serviceId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.selectedPrice * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      totalItems, 
      totalPrice,
      showUpsell,
      setShowUpsell
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
