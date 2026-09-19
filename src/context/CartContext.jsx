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
      // Determine size and color values from incoming product payload
      const size = product.selected_size || product.selectedSize || selectedSize;
      const color = product.selected_color || product.color || null;
      const variantId = product.selected_variant_id || null;
      
      // Determine the specific image URL for this variant/color choice
      const itemImage = product.image || product.color_image_url || product.image_url;

      // Unique match criteria: same product ID, same size, and same color
      const existingItemIndex = prevCart.findIndex(
        (item) => 
          item.id === product.id && 
          item.selectedSize === size && 
          (item.selected_color || null) === (color || null)
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const addQty = product.quantity || 1;
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + addQty,
          // Update image to latest selected image if missing
          image: updatedCart[existingItemIndex].image || itemImage,
        };
        return updatedCart;
      }

      return [
        ...prevCart, 
        { 
          ...product, 
          selectedSize: size, 
          selected_color: color,
          selected_variant_id: variantId,
          image: itemImage,
          quantity: product.quantity || 1 
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, selectedSize, selectedColor = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => 
          !(
            item.id === id && 
            item.selectedSize === selectedSize && 
            (item.selected_color || null) === (selectedColor || null)
          )
      )
    );
  };

  const updateQuantity = (id, selectedSize, amount, selectedColor = null) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (
          item.id === id && 
          item.selectedSize === selectedSize && 
          (item.selected_color || null) === (selectedColor || null)
        ) {
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