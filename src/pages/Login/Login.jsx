import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FcGoogle } from 'react-icons/fc';
import logo from '../logo.png';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  // Populate initial state from route location state passed from Signup page
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState(location.state?.password || '');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If state contains pre-filled details from signup, assign them
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.password) {
      setPassword(location.state.password);
    }
  }, [location.state]);

  // Helper function to direct users based on their role
  const handlePostLoginRedirect = async (user) => {
    const isAdminMeta = user?.user_metadata?.role === 'admin' || user?.user_metadata?.is_admin === true;

    if (isAdminMeta) {
      navigate('/admin');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Strict Email Validation
    const emailClean = email.trim();
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailClean) {
      setEmailError('Email address is required.');
      return;
    } else if (!strictEmailRegex.test(emailClean)) {
      setEmailError('Please enter a full email address (e.g. name@mail.com).');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: emailClean.toLowerCase(), 
      password 
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data?.user) {
      await handlePostLoginRedirect(data.user);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/shop`,
      },
    });

    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg max-w-md w-full space-y-6">
        <div className="text-center">
          <img 
            src={logo} 
            alt="Gladys Closet Logo" 
            className="h-16 w-auto mx-auto object-contain rounded-full shadow-sm cursor-pointer"
          />
          <h1 className="text-2xl font-black text-brand-navy">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your account and orders</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span>OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleEmailLogin} noValidate className="space-y-4">
          <p className="text-xs text-gray-500 mb-4">
            Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are required.
          </p>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              className={`w-full p-3 border rounded-xl text-sm outline-none focus:border-brand-purple ${
                emailError ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="name@mail.com"
            />
            {emailError && (
              <p className="text-xs text-red-500 font-medium mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-purple font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}