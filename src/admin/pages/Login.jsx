import React, { useContext, useState } from 'react';
import { Navigate, useLocation, useNavigate } from "react-router";
import { AuthContext } from '../contexts/auth-context';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useContext(AuthContext);
  const redirectTo = location.state?.from?.pathname || '/admin';
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (!result?.success) {
        setError(result?.error || 'Authentication failed');
        return;
      }

      const admin = result?.data?.admin;
      const isSuperAdmin = admin?.role === 'superadmin';
      if (!isSuperAdmin) {
        setError('Access denied. Super admin privileges required.');
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="mx-auto flex flex-col items-center">
          <img
            src="/admin/everzone-logo.jpg"
            alt="Ever Zone"
            className="h-25 w-25 object-contain"
          />
          <h1 className="mt-6 text-center text-3xl font-semibold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Sign in to your Ever Zone administrator account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 mx-auto w-full max-w-md">
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600">
                Email or Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Email or username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.6 10.6a3 3 0 004.24 4.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.4 7.4C5.4 8.7 3.8 10.5 3 12c1.8 3.5 5.9 7 9 7 1.1 0 2.2-.2 3.2-.6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.2 14.2c-.6.5-1.4.8-2.2.8a3 3 0 01-3-3c0-.8.3-1.6.8-2.2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.9 4.2C10.6 4.1 11.3 4 12 4c3.1 0 7.2 3.5 9 8-0.7 1.3-1.7 2.7-2.9 3.9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                      <path
                        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-sky-500 hover:text-sky-600"
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full justify-center rounded-lg bg-[#2c6480] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245367] focus:outline-none focus:ring-2 focus:ring-[#2c6480] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;