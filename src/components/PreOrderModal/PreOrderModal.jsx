import { useState } from 'react';
import { FiX, FiMail, FiCheck, FiUser, FiPhone, FiMapPin } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

export default function PreOrderModal({ product, onClose }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    location: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('preorder_subscribers')
        .insert([
          {
            product_id: product.id,
            full_name: formData.full_name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone_number: formData.phone_number.trim(),
            location: formData.location.trim(),
          },
        ]);

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving pre-order:', err);
      setError('Could not submit your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <FiX className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Pre-Order Recorded!</h3>
            <p className="text-sm text-gray-500">
              Thank you, <strong>{formData.full_name}</strong>. We reserved your interest for <strong>{product.name}</strong> and will contact you at <strong>{formData.phone_number}</strong> or <strong>{formData.email}</strong> as soon as stock arrives.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <FiMail className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Pre-Order Interest</h3>
            <p className="text-sm text-gray-500 mt-1">
              Fill in your details to get notified first when <strong>{product.name}</strong> is back in stock.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Abena Mansa"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="024 123 4567"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Location / City
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. East Legon, Accra"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Pre-Order Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}