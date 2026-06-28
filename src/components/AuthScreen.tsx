import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Mail, Sparkles } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError("Name is required.");
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An authentication error occurred.";
      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        msg = "Email & Password login is disabled in your Firebase console. Please go to your Firebase Console > Authentication > Sign-in Method, and enable 'Email/Password' under Sign-in Providers to use email login. Otherwise, please use the Google Sign-In option.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F3] dark:bg-[#0A0A0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded border border-[#EBEBE9] dark:border-[#252524] bg-white dark:bg-[#151514] text-black dark:text-white mb-3 shadow-xs">
          <KeyRound className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white">
          LOCKTFIN
        </h2>
        <p className="mt-1 text-xs text-[#8E8E8D]">
          Personal IBDP & IPMAT Study Workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#151514] py-6 px-5 border border-[#EBEBE9] dark:border-[#252524] shadow-xs sm:rounded-xl sm:px-8">
          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-50 text-rose-700 border border-rose-150 text-xs font-bold dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
              {error}
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-xs"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-1.5 px-4 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EBEBE9] dark:border-[#252524]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                <span className="px-2 bg-white dark:bg-[#151514] text-[#8E8E8D]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center items-center py-1.5 px-4 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 hover:bg-[#F4F4F3] dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
