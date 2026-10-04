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
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Full Name Validation
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required.';
    }

    // 2. Strict Phone Number Validation
    // Rejects sequential test inputs like "1234567890" and enforces valid phone formats (e.g., 024XXXXXXX or +233XXXXXXX)
    const phoneClean = formData.phone_number.trim();
    const ghanaPhoneRegex = /^(?:\+233|0)(20|23|24|25|26|27|28|50|53|54|55|56|57|59|30)\d{7}$/;
    const sequentialRegex = /^1234567890$/;

    if (!phoneClean) {
      errors.phone_number = 'Phone number is required.';
    } else if (sequentialRegex.test(phoneClean)) {
      errors.phone_number = 'Please enter a valid phone number.';
    } else if (!ghanaPhoneRegex.test(phoneClean)) {
      errors.phone_number = 'Enter a valid phone number (e.g. 0241234567).';
    }

    // 3. Location Validation
    // Rejects single character inputs like "A"
    const locationClean = formData.location.trim();
    if (!locationClean) {
      errors.location = 'Location is required.';
    } else if (locationClean.length < 3) {
      errors.location = 'Please enter a specific address or neighborhood (at least 3 letters).';
    }

    // 4. Strict Email Validation
    // Requires standard format: name@mail.com
    const emailClean = formData.email.trim();
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailClean) {
      errors.email = 'Email address is required.';
    } else if (!strictEmailRegex.test(emailClean)) {
      errors.email = 'Enter a valid email address (e.g. name@mail.com).';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Execute client-side validation checks
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

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

            {/* Explanation Note for Asterisks */}
            <p className="text-xs text-gray-500 mt-3">
              Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are required.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Abena Mansa"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600 ${
                      fieldErrors.full_name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.full_name && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@mail.com"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600 ${
                      fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="0241234567"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600 ${
                      fieldErrors.phone_number ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.phone_number && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.phone_number}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Location / City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. East Legon, Accra"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-purple-600 ${
                      fieldErrors.location ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.location && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.location}</p>
                )}
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