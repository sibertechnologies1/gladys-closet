import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import CartDrawer from './components/CartDrawer/CartDrawer';
import CheckoutModal from './components/CheckoutModal/CheckoutModal';

function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home onProceedToCheckout={() => setIsCheckoutOpen(true)} />} />
      </Routes>

      {/* Global Slide-over Cart */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Global Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}

export default App;