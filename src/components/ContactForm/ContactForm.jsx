import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Save submission to Supabase
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message,
          },
        ]);

      if (dbError) throw dbError;

      // 2. Trigger notification function (Optional)
      await supabase.functions.invoke('send-contact-notification', {
        body: formData,
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

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
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Gladys Closet"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Your Message
                </label>
                <textarea
                  rows="5"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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