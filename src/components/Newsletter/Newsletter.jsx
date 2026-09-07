import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage("You're already subscribed!");
        } else {
          setMessage("Something went wrong. Please try again.");
        }
        setStatus('error');
      } else {
        setStatus('success');
        setMessage("Thank you for subscribing! Check your inbox soon.");
        setEmail('');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage("Unexpected error occurred.");
    }
  };

  return (
    <section className="py-14 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Join the Gladys' Closet Club
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto mb-8">
          Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals delivered straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="px-4 py-3 bg-gray-800 text-white placeholder-gray-500 rounded-md border border-gray-700 focus:outline-none focus:border-teal-500 flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 font-semibold text-sm rounded-md transition duration-200 disabled:opacity-50"
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}