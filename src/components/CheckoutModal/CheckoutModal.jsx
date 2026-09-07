import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLock } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, totalPesewas, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
  });

  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handlePaystackPayment = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setLoading(true);
    const orderNumber = `GC-${Date.now()}`;

    try {
      // 1. Save order to Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
            delivery_address: customer.address,
            city: customer.city,
            region: customer.region,
            items: cart,
            total_pesewas: totalPesewas,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      if (!window.PaystackPop) {
        throw new Error('Paystack SDK failed to load. Check your internet connection.');
      }

      // 2. Initialize Paystack Popup with explicit inline callback syntax
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: customer.email,
        amount: totalPesewas,
        currency: 'GHS',
        ref: orderNumber,
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: customer.name },
            { display_name: 'Phone', variable_name: 'customer_phone', value: customer.phone },
          ],
        },
        callback: function (response) {
          supabase
            .from('orders')
            .update({ status: 'paid', paystack_reference: response.reference })
            .eq('id', order.id)
            .then(() => {
              clearCart();
              setLoading(false);
              onClose();
              alert('Payment Successful! Your order has been placed.');
            })
            .catch((err) => {
              console.error('Post-payment error:', err);
              alert('Payment was received, but updating order status failed. Please contact support.');
              setLoading(false);
            });
        },
        onClose: function () {
          alert('Payment window closed. Order saved as pending.');
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      alert(`Checkout Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-purple-100"
        >
          {/* Header */}
          <div className="p-6 bg-brand-purple text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold tracking-wide">Delivery & Payment</h2>
              <p className="text-xs text-brand-lightPurple mt-1">Complete your order for Gladys' Closet</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePaystackPayment} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Full Name</label>
              <input
                required
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Ama Mensah"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-brand-purple text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Email</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="ama@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-brand-purple text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="024XXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-brand-purple text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Delivery Address</label>
              <textarea
                required
                name="address"
                rows="2"
                value={customer.address}
                onChange={handleChange}
                placeholder="House No., Street Name, Landmark"
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-brand-purple text-sm"
              ></textarea>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-xl bg-brand-lightPurple flex justify-between items-center my-2">
              <span className="text-sm font-bold text-brand-purple">Total Amount Due</span>
              <span className="text-xl font-black text-brand-navy">
                GHS {(totalPesewas / 100).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-pink hover:bg-brand-purple text-white py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition duration-300 shadow-lg disabled:opacity-50"
            >
              <FiLock className="w-4 h-4" />
              {loading ? 'Processing...' : 'Pay Now via Paystack'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}