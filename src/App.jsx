import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Storefront Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Shop from './pages/Shop/Shop';
import Cart from './pages/Cart/Cart';
import Favorites from './pages/Favorites/Favorites';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Login from './pages/admin/Login';

// Components & Context
import CartDrawer from './components/CartDrawer/CartDrawer';
import CheckoutModal from './components/CheckoutModal/CheckoutModal';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <Routes>
            {/* Storefront Routes */}
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
            <Route 
              path="/cart" 
              element={<Cart onProceedToCheckout={handleOpenCheckout} />} 
            />
            <Route 
              path="/favorites" 
              element={<Favorites />} 
            />
            <Route 
              path="/contact" 
              element={<Contact />} 
            />

            {/* Public Admin Route */}
            <Route 
              path="/admin/login" 
              element={<Login />} 
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
            </Route>
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
    </AuthProvider>
  );
}

export default App;