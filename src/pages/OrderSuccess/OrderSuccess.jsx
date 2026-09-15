import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiUserPlus, FiArrowRight } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const orderData = location.state || {};
  const orderId = orderData.orderId || sessionStorage.getItem('last_order_id');

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuest(!session);
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleCreateAccount = () => {
    const emailParam = orderData.customerEmail ? `?email=${encodeURIComponent(orderData.customerEmail)}` : '';
    navigate(`/signup${emailParam}`);
  };

  if (loading) return null;

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <FiCheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-gray-600 text-sm max-w-md mb-6">
          Thank you for shopping with Gladys' Closet. We have received your payment and dispatched your confirmation details.
        </p>

        {orderData.orderNumber && (
          <div className="bg-purple-50 border border-purple-100 text-purple-800 px-6 py-3 rounded-xl font-bold text-sm mb-8">
            Order Reference: {orderData.orderNumber}
          </div>
        )}

        {/* Guest Prompt Banner */}
        {isGuest && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 md:p-8 max-w-xl text-left shadow-sm mb-8">
            <h2 className="font-extrabold text-gray-900 text-base mb-2 flex items-center gap-2">
              <FiUserPlus className="text-purple-600" /> Create an Account
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Create an account to access your dashboard, view your order history, track your orders, save your favorites, and manage your shopping details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateAccount}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                Create Account <FiArrowRight />
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-bold px-5 py-3 rounded-xl transition flex items-center justify-center"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {!isGuest && (
          <Link
            to="/dashboard"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition inline-flex items-center gap-2"
          >
            Go to Your Dashboard <FiArrowRight />
          </Link>
        )}
      </main>

      <Footer />
    </div>
  );
}