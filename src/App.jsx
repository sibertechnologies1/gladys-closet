import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Shop from './pages/Shop/Shop';
import CartDrawer from './components/CartDrawer/CartDrawer';
import CheckoutModal from './components/CheckoutModal/CheckoutModal';
import { CartProvider } from './context/CartContext';

function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <CartProvider>
      <div>
        <Routes>
          <Route 
            path="/" 
            element={<Home onProceedToCheckout={handleOpenCheckout} />} 
          />

         <Route 
            path="/about" 
            element={<About />} 
          />
          
          <Route 
            path="/shop" 
            element={<Shop />} 
          />
        </Routes>

        {/* Global Slide-over Cart */}
        <CartDrawer onProceedToCheckout={handleOpenCheckout} />

        {/* Global Checkout Modal */}
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
        />
      </div>
    </CartProvider>
  );
}

export default App;