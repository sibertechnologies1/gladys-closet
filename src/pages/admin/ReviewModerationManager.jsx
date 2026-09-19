import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ReviewModerationManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', or 'all'
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  async function fetchReviews() {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err.message);
    } fontFinally: {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setReviews((prev) =>
        filter === 'all'
          ? prev.map((r) => (r.id === id ? { ...r, status } : r))
          : prev.filter((r) => r.id !== id)
      );
    } catch (err) {
      alert(`Failed to update review status: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;

    setActionLoading(id);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(`Failed to delete review: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Review Moderation</h2>
          <p className="text-xs text-gray-500 mt-0.5">Approve, reject, or manage public customer feedback.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex w-full sm:w-auto bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          {['pending', 'approved', 'all'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg capitalize transition-colors text-center ${
                filter === tab
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table / List */}
      {loading ? (
        <div className="py-12 text-center text-xs sm:text-sm text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-xs sm:text-sm text-gray-500">
          No {filter !== 'all' ? filter : ''} reviews found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((rev) => (
            <div key={rev.id} className="py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Customer Avatar & Review Content */}
              <div className="flex items-start gap-3 flex-1 w-full">
                <img
                  src={
                    rev.author_image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      rev.author_name || 'Customer'
                    )}&background=0D9488&color=fff`
                  }
                  alt={rev.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 mt-0.5"
                />

                <div className="space-y-1 w-full min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{rev.author_name || 'Anonymous'}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                        rev.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : rev.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rev.status || 'pending'}
                    </span>
                  </div>

                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                    "{rev.comment}"
                  </p>
                  
                  <span className="text-[10px] text-gray-400 block pt-0.5">
                    Submitted on: {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                {rev.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    disabled={actionLoading === rev.id}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-center"
                  >
                    Approve
                  </button>
                )}

                {rev.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(rev.id, 'pending')}
                    disabled={actionLoading === rev.id}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 text-center"
                  >
                    Unpublish
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(rev.id)}
                  disabled={actionLoading === rev.id}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 text-center"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}