import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchUserData();
  }, []);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-fill logged-in user's name and Google profile image
  async function fetchUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Capture Name
        const fullName = 
          user.user_metadata?.full_name || 
          user.user_metadata?.name || 
          user.email?.split('@')[0] || 
          '';
        
        // Capture Google Profile Image URL if available
        const avatar = 
          user.user_metadata?.avatar_url || 
          user.user_metadata?.picture || 
          '';

        setAuthorName(fullName);
        setGoogleAvatarUrl(avatar);
      }
    } catch (err) {
      console.error('Error getting auth user:', err);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let finalAuthorImage = googleAvatarUrl || null;

      // Priority: If user uploads a custom file, use that. Otherwise, use Google Avatar URL.
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('review-avatars')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('review-avatars')
          .getPublicUrl(filePath);

        finalAuthorImage = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('reviews').insert([
        {
          author_name: authorName,
          comment: comment,
          rating: rating,
          author_image: finalAuthorImage,
          status: 'pending'
        }
      ]);

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: 'Thank you! Your review was submitted for approval.' });
      setComment('');
      setRating(5);
      setImageFile(null);

      setTimeout(() => {
        setShowModal(false);
        setMessage(null);
      }, 2500);

    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error submitting review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-gray-50 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
              What Our Customers Say
            </h2>
            <p className="text-sm text-gray-600">Real feedback from shoppers at Gladys' Closet</p>
          </div>
          <button
            onClick={() => {
              fetchUserData();
              setShowModal(true);
            }}
            className="bg-amber-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-amber-600 transition-colors"
          >
            Leave a Review
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No published reviews yet. Be the first to leave one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-yellow-400 mb-3 text-sm">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img
                    src={
                      review.author_image ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        review.author_name || 'Customer'
                      )}&background=0D9488&color=fff`
                    }
                    alt={review.author_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {review.author_name}
                    </h4>
                    <span className="text-xs text-green-600 font-medium">
                      Verified Customer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h3>
            <p className="text-xs text-gray-500 mb-4">Share your experience shopping with us.</p>

            {message && (
              <div
                className={`p-3 rounded mb-4 text-xs ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex text-amber-400 text-xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      {star <= rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abena Mensah"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Profile Image Logic */}
              {googleAvatarUrl ? (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                  <img
                    src={googleAvatarUrl}
                    alt="Account Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Google Profile Picture Detected</p>
                    <p className="text-[10px] text-gray-500">This photo will be used with your review.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Profile Photo <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Experience</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What did you think of the outfit, quality, or service?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}