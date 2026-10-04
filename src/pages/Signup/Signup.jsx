import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import logo from '../logo.png';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      // Show confirmation modal if user signup succeeds and requires email verification
      if (data?.user && !data?.session) {
        setShowModal(true);
      } else {
        navigate('/shop');
      }
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg max-w-md w-full space-y-6">
        <div className="text-center">
          <img 
            src={logo} 
            alt="Gladys Closet Logo" 
            className="h-16 w-auto mx-auto object-contain rounded-full shadow-sm cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-1">Join Gladys' Closet for personalized shopping</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignup}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
        >
          <FcGoogle className="w-5 h-5" />
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span>OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
        <p className="text-xs text-gray-500 mb-4">
              Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are required.
            </p>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-purple"
              placeholder="Gladys Closet"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-purple"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-purple"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-purple text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-pink transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-purple font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-purple-100 text-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Your Email</h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              We've sent a verification link to <span className="font-semibold text-gray-900">{email}</span>. Please check your inbox to confirm your account before logging in.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left mb-5">
              <p className="text-[11px] text-amber-800">
                <span className="font-bold">Can't find the email?</span> Check your spam or junk folder in case it was routed there by mistake.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-brand-purple text-white py-2.5 rounded-xl text-xs font-bold hover:bg-brand-pink transition"
            >
              Proceed to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}