import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Storefront Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Shop from './pages/Shop/Shop';
import Cart from './pages/Cart/Cart';
import NewArrivals from './pages/NewArrivals/NewArrivals';
import Favorites from './pages/Favorites/Favorites';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

// Customer Dashboard
import CustomerDashboard from './pages/Dashboard/Dashboard';

// Admin Pages
import Dashoard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';

// Admin Dashboard & Layout Component
import AdminLayout from './components/admin/AdminLayout';

// Components & Context
import CartDrawer from './components/CartDrawer/CartDrawer';
import CheckoutModal from './components/CheckoutModal/CheckoutModal';
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
            <Route path="/" element={<Home onProceedToCheckout={handleOpenCheckout} />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/newarrivals" element={<NewArrivals />} />
            <Route path="/cart" element={<Cart onProceedToCheckout={handleOpenCheckout} />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/contact" element={<Contact />} />

            {/* Customer Authentication & Dashboard */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Public Admin Login Route */}
          <Route path="/admin/AdminLogin" element={<AdminLogin />} />
          

            {/* Protected Admin Routes */}
           <Route path="/admindashboard" element={<AdminLayout />}>

              <Route index element={<Dashoard />} />
              <Route path="dashboard" element={<Dashoard />} />
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