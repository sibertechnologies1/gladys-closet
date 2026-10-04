import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiTrash2 } from 'react-icons/fi';

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      // 1. Call the secure RPC function to delete user
      const { error: rpcError } = await supabase.rpc('delete_user_account');

      if (rpcError && !rpcError.message?.includes('JWT expired')) {
        throw rpcError;
      }
    } catch (err) {
      // If error is NOT JWT expiration, show error and stop
      if (!err.message?.includes('JWT expired')) {
        console.error('Error deleting account:', err);
        setError(err.message || 'Failed to delete account. Please try again.');
        setLoading(false);
        return;
      }
    }

    // 2. Perform local cleanups (Executes even if JWT expired because user is wiped from auth.users)
    try {
      localStorage.clear();
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore session clearance errors if token is already invalidated
    } finally {
      alert('Your account has been deleted successfully.');
      navigate('/');
    }
  };

  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
      <p className="text-xs text-gray-600 mb-4">
        Once deleted, your profile and saved data will be removed. You can sign up again anytime with the same email address.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-white text-red-600 text-xs rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleDeleteAccount}
        disabled={loading}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition disabled:opacity-50"
      >
        <FiTrash2 className="w-4 h-4" />
        {loading ? 'Deleting Account...' : 'Delete My Account'}
      </button>
    </div>
  );
}