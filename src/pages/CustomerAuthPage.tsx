import { FormEvent, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CustomerAuthPageProps {
  navigate: (path: string) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function CustomerAuthPage({ navigate }: CustomerAuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMsg('');

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) { console.error("Customer signup error:", error); throw new Error(error.message + " [" + (error.status ?? "no status") + "] [" + (error.code ?? "no code") + "]"); }

        setMessage(
          'Your account has been created. Please check your email if email confirmation is required, then sign in.'
        );
        setMode('signin');
        setPassword('');
        return;
      }

      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/#/auth`,
        });

        if (error) throw error;

        setMessage('If an account exists for this email, a password reset link has been sent.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      navigate('/book');
    } catch (err) {
      const messageText =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Something went wrong. Please try again.';

      setErrorMsg(messageText);
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'signup'
      ? 'Create Your Customer Account'
      : mode === 'forgot'
        ? 'Reset Your Password'
        : 'Customer Sign In';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              {mode === 'signup' ? <UserPlus size={26} /> : <Lock size={26} />}
            </div>

            <h1 className="text-2xl font-bold text-brand-900">{title}</h1>

            <p className="mt-2 text-sm text-slate-600">
              {mode === 'signup'
                ? 'Create an account to manage your P4L Mobile Notary requests.'
                : mode === 'forgot'
                  ? 'Enter your email address and we will send you a password reset link.'
                  : 'Sign in to access your customer booking information.'}
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-12 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    placeholder="Your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'forgot'
                    ? 'Send Reset Link'
                    : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setMessage('');
                    setErrorMsg('');
                  }}
                  className="font-medium text-brand-700 hover:text-brand-900"
                >
                  Forgot your password?
                </button>

                <p className="text-slate-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setMessage('');
                      setErrorMsg('');
                    }}
                    className="font-semibold text-brand-700 hover:text-brand-900"
                  >
                    Create one
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setMessage('');
                    setErrorMsg('');
                  }}
                  className="font-semibold text-brand-700 hover:text-brand-900"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setMessage('');
                  setErrorMsg('');
                }}
                className="font-semibold text-brand-700 hover:text-brand-900"
              >
                Back to Sign In
              </button>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/book')}
                className="font-medium text-slate-600 hover:text-slate-900"
              >
                Continue without an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

