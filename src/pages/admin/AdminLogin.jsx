import { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { FiEye, FiEyeOff } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import logo from "./logo.jpeg"; // Adjust path if logo is stored in src/assets/logo.jpeg



export default function AdminLogin() {

  const { signIn } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);



 const redirectTo = "/admindashboard";



  async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    setSubmitting(true);

    try {

      const { error: signInError } = await signIn(email, password);

      if (signInError) throw signInError;

      navigate(redirectTo, { replace: true });

    } catch (err) {

      setError("Invalid email or password. Please try again.");

    } finally {

      setSubmitting(false);

    }

  }



  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 px-4 py-12">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">

       

        {/* Header Branding with Logo */}

        <div className="text-center mb-8">

          <div className="inline-block p-1 bg-gray-900 rounded-2xl shadow-md mb-4">

            <img

              src={logo}

              alt="Gladys' Closet Logo"

              className="w-20 h-20 object-cover rounded-xl"

            />

          </div>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight">

            Gladys' Closet

          </h1>

          <p className="text-sm text-gray-500 mt-1">

            Store Management Portal

          </p>

        </div>



        {/* Error Alert */}

        {error && (

          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">

            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

            </svg>

            <span>{error}</span>

          </div>

        )}



        {/* Login Form */}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>

            <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">

              Email Address

            </label>

            <input

              id="email"

              type="email"

              required

              autoComplete="username"

              placeholder="manager@gladyscloset.com"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition placeholder:text-gray-400"

            />

          </div>



          <div>

            <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">

              Password

            </label>

            <div className="relative">

              <input

                id="password"

                type={showPassword ? "text" : "password"}

                required

                autoComplete="current-password"

                placeholder="••••••••"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition placeholder:text-gray-400"

              />

              <button

                type="button"

                onClick={() => setShowPassword(!showPassword)}

                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"

                aria-label={showPassword ? "Hide password" : "Show password"}

              >

                {showPassword ? (

                  <FiEyeOff className="w-5 h-5" />

                ) : (

                  <FiEye className="w-5 h-5" />

                )}

              </button>

            </div>

          </div>



          <button

            type="submit"

            disabled={submitting}

            className="w-full mt-2 py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"

          >

            {submitting ? (

              <>

                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">

                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />

                </svg>

                <span>Authenticating...</span>

              </>

            ) : (

              "Sign In to Dashboard"

            )}

          </button>

        </form>



        {/* Footer info */}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">

          <p className="text-xs text-gray-400">

            Protected internal area. Authorized personnel only.

          </p>

        </div>



      </div>

    </div>

  );

}

