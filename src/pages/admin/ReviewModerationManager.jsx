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
    } finally {
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

      // Update local state to reflect change immediately
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
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm max-w-6xl mx-auto">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Review Moderation</h2>
          <p className="text-xs text-gray-500 mt-0.5">Approve, reject, or manage public customer feedback.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-md text-xs font-semibold">
          {['pending', 'approved', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                filter === tab
                  ? 'bg-white text-gray-900 shadow-sm'
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
        <div className="py-12 text-center text-sm text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No {filter !== 'all' ? filter : ''} reviews found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 mt-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Customer Avatar & Review Content */}
              <div className="flex items-start gap-3 flex-1">
                <img
                  src={
                    rev.author_image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      rev.author_name || 'Customer'
                    )}&background=0D9488&color=fff`
                  }
                  alt={rev.author_name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 mt-1"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900">{rev.author_name || 'Anonymous'}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
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

                  <div className="flex text-amber-400 text-xs my-1">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed italic">"{rev.comment}"</p>
                  
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Submitted on: {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    disabled={actionLoading === rev.id}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}

                {rev.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'pending')}
                    disabled={actionLoading === rev.id}
                    className="px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    Unpublish
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rev.id)}
                  disabled={actionLoading === rev.id}
                  className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
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