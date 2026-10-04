import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FiTrash2 } from 'react-icons/fi';

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? All orders and profile history will be permanently deleted.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      // 1. Trigger deletion via RPC
      const { error: rpcError } = await supabase.rpc('delete_user_account');

      if (rpcError && !rpcError.message?.includes('JWT expired')) {
        throw rpcError;
      }
    } catch (err) {
      if (!err.message?.includes('JWT expired')) {
        console.error('Error deleting account:', err);
        setError(err.message || 'Failed to delete account.');
        setLoading(false);
        return;
      }
    } finally {
      // 2. Clear browser session storage
      await supabase.auth.signOut({ scope: 'local' });
      localStorage.clear();
      sessionStorage.clear();

      alert('Your account has been permanently deleted.');
      
      // 3. Force page reload to reset state
      window.location.href = '/signup';
    }
  };

  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
      <p className="text-xs text-gray-600 mb-4">
        Once deleted, your profile and purchase history will be permanently removed.
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