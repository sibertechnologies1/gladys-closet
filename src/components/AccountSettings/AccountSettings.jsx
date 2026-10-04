import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.'
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      // 1. Call the secure RPC function to delete user from auth.users & public.profiles
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      // 2. Sign out the local session
      await supabase.auth.signOut();

      alert('Your account has been deleted successfully.');
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-red-100 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account</h2>
      <p className="text-xs text-gray-500 mb-4">
        Once deleted, your profile and saved data will be removed. You can sign up again anytime with the same email.
      </p>

      <button
        onClick={handleDeleteAccount}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50"
      >
        {loading ? 'Deleting Account...' : 'Delete My Account'}
      </button>
    </div>
  );
}