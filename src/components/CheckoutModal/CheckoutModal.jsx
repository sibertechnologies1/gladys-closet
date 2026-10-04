import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLock } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import LocationInput from '../LocationInput/LocationInput';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, totalPesewas, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
  });
  const [fieldErrors, setFieldErrors] = useState({});

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
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateCheckoutForm = () => {
    const errors = {};

    // 1. Strict Phone Number Validation
    const phoneClean = customer.phone.trim();
    const ghanaPhoneRegex = /^(?:\+233|0)(20|23|24|25|26|27|28|50|53|54|55|56|57|59|30)\d{7}$/;
    const sequentialRegex = /^1234567890$/;

    if (!phoneClean) {
      errors.phone = 'Phone number is required.';
    } else if (sequentialRegex.test(phoneClean)) {
      errors.phone = 'Please enter a valid phone number.';
    } else if (!ghanaPhoneRegex.test(phoneClean.replace(/\s+/g, ''))) {
      errors.phone = 'Enter a valid phone number (e.g. 0241234567).';
    }

    // 2. Strict Email Validation (Blocks p@gmail and missing top-level domains)
    const emailClean = customer.email.trim();
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailClean) {
      errors.email = 'Email address is required.';
    } else if (!strictEmailRegex.test(emailClean)) {
      errors.email = 'Please enter a full email address (e.g. name@mail.com).';
    }

    // 3. Location/Address Validation
    const addressClean = customer.address.trim();
    const addressRegex = /^[a-zA-Z0-9\s,.-/#]+$/;

    if (!addressClean) {
      errors.address = 'Delivery address is required.';
    } else if (addressClean.length < 3) {
      errors.address = 'Please enter a specific delivery address (at least 3 characters).';
    } else if (!addressRegex.test(addressClean)) {
      errors.address = 'Address contains invalid characters.';
    }

    return errors;
  };

  const handlePaymentSuccess = async (response, orderNumber, orderId) => {
    try {
      await supabase
        .from('orders')
        .update({ status: 'paid', paystack_reference: response.reference })
        .eq('id', orderId);

      for (const item of cart) {
        const targetId = item.id || item.product_id;
        if (!targetId) continue;

        const { data: product, error: fetchErr } = await supabase
          .from('products')
          .select('stock')
          .eq('id', targetId)
          .maybeSingle();

        if (fetchErr) {
          console.error(`Error fetching stock for product ${targetId}:`, fetchErr);
          continue;
        }

        if (product) {
          const qtyToSubtract = Number(item.quantity) || 1;
          const currentStock = Number(product.stock) || 0;
          const newStock = Math.max(0, currentStock - qtyToSubtract);

          const { error: updateErr } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', targetId);

          if (updateErr) {
            console.error(`Failed to update stock for product ${targetId}:`, updateErr);
          }
        }
      }

      const formattedItems = cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: (item.price_pesewas || item.price * 100) / 100,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vtlezevxnuyahpxzcutm.supabase.co';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          orderId: orderNumber,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          items: formattedItems,
          totalAmount: totalPesewas / 100,
          shippingAddress: `${customer.address}, ${customer.city}, ${customer.region}`,
        }),
      });

      sessionStorage.setItem('last_order_id', orderId);

      clearCart();
      setLoading(false);
      onClose();

      navigate('/order-success', {
        state: {
          orderId,
          orderNumber,
          customerEmail: customer.email,
        },
      });
    } catch (err) {
      console.error('Post-payment execution error:', err);
      alert('Payment received, but failed to process inventory update or dispatch receipt.');
      setLoading(false);
    }
  };

  const handlePaystackPayment = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const validationErrors = validateCheckoutForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    const orderNumber = `GC-${Date.now()}`;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: currentUserId,
            order_number: orderNumber,
            customer_name: customer.name.trim(),
            customer_email: customer.email.trim().toLowerCase(),
            customer_phone: customer.phone.trim(),
            delivery_address: customer.address.trim(),
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

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: customer.email.trim().toLowerCase(),
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
          handlePaymentSuccess(response, orderNumber, order.id);
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
          <div className="p-6 bg-brand-purple text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold tracking-wide">Delivery & Payment</h2>
              <p className="text-xs text-brand-lightPurple mt-1">Complete your order for Gladys' Closet</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handlePaystackPayment} noValidate className="p-6 space-y-4">
            <p className="text-xs text-gray-500">
              Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are required.
            </p>

            <div>
              <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
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
                <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                  placeholder="name@mail.com"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-brand-purple text-sm ${
                    fieldErrors.email ? 'border-red-500' : 'border-purple-200'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customer.phone}
                  onChange={handleChange}
                  placeholder="024XXXXXXX"
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:border-brand-purple text-sm ${
                    fieldErrors.phone ? 'border-red-500' : 'border-purple-200'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <LocationInput
                value={customer.address}
                onChange={(val) => {
                  setCustomer((prev) => ({ ...prev, address: val }));
                  if (fieldErrors.address) {
                    setFieldErrors((prev) => ({ ...prev, address: '' }));
                  }
                }}
                error={fieldErrors.address}
              />
            </div>

            <div className="p-4 rounded-xl bg-brand-lightPurple flex justify-between items-center my-2">
              <span className="text-sm font-bold text-brand-purple">Total Amount Due</span>
              <span className="text-xl font-black text-brand-navy">
                GH₵ {(totalPesewas / 100).toFixed(2)}
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