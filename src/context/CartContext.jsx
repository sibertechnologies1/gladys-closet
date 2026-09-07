import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Load initial cart state from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('gladys_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart state with localStorage whenever it updates
  useEffect(() => {
    try {
      localStorage.setItem('gladys_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product, selectedSize = 'M') => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      }

      return [...prevCart, { ...product, selectedSize, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, selectedSize) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (id, selectedSize, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalPesewas = cart.reduce(
    (sum, item) => sum + (item.price_pesewas || 0) * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPesewas,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);