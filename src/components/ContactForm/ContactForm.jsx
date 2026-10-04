import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import LocationInput from '../LocationInput/LocationInput';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill email if user is logged in
  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
      }
    }
    loadUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Phone Validation
    const phoneClean = formData.phone.trim();
    if (phoneClean.length > 0) {
      const ghanaPhoneRegex = /^(?:\+233|0)(20|23|24|25|26|27|28|50|53|54|55|56|57|59|30)\d{7}$/;
      const sequentialRegex = /^1234567890$/;

      if (sequentialRegex.test(phoneClean)) {
        errors.phone = 'Please enter a valid phone number.';
      } else if (!ghanaPhoneRegex.test(phoneClean.replace(/\s+/g, ''))) {
        errors.phone = 'Enter a valid phone number (e.g. 0241234567 or +233241234567).';
      }
    }

    // 2. Strict Email Validation
    const emailClean = formData.email.trim();
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailClean) {
      errors.email = 'Email address is required.';
    } else if (!strictEmailRegex.test(emailClean)) {
      errors.email = 'Enter a valid email address (e.g. name@mail.com).';
    }

    // 3. Location Validation
    const locationClean = formData.location.trim();
    const locationRegex = /^[a-zA-Z\s,.-]+$/;
    if (!locationClean) {
      errors.location = 'Location is required.';
    } else if (locationClean.length < 2) {
      errors.location = 'Please enter a valid city or region name (at least 2 characters).';
    } else if (!locationRegex.test(locationClean)) {
      errors.location = 'Location contains invalid characters.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // 1. Save submission to Supabase
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim() || null,
            location: formData.location.trim(),
            message: formData.message.trim(),
          },
        ]);

      if (dbError) throw dbError;

      // 2. Trigger notification function
      await supabase.functions.invoke('send-contact-notification', {
        body: formData,
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', location: '', message: '' });
      setFieldErrors({});
    } catch (err) {
      console.error('Error submitting message:', err);
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Contact Info */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              Contact Information
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              We'd Love to Hear From You
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Reach out through any of these channels or send us a message directly.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Store Location</h3>
                <p className="text-gray-600 text-xs mt-1">Accra, Ghana</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FiPhone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Phone Number</h3>
                <p className="text-gray-600 text-xs mt-1">+233 (0) 595 805 215</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FiMail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Email Address</h3>
                <p className="text-gray-600 text-xs mt-1">gladyscloset61@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Working Hours</h3>
                <p className="text-gray-600 text-xs mt-1">Mon - Sun: 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
          <p className="text-xs text-gray-500 mb-6">
            Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are required.
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          {submitted ? (
            <div className="bg-green-50 border border-green-100 text-green-800 p-6 rounded-2xl text-center space-y-2">
              <FiCheckCircle className="w-10 h-10 text-green-600 mx-auto" />
              <h3 className="font-bold text-base">Message Sent Successfully!</h3>
              <p className="text-xs text-green-700">
                Thank you for reaching out. A team member will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-semibold text-purple-600 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Gladys Closet"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600 ${
                      fieldErrors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+233 24 000 0000"
                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600 ${
                      fieldErrors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <LocationInput
                    value={formData.location}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, location: val }));
                      if (fieldErrors.location) {
                        setFieldErrors((prev) => ({ ...prev, location: '' }));
                      }
                    }}
                    error={fieldErrors.location}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="5"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSend className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}