import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Wrench, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, getDefaultRedirect } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login' && from !== '/register') {
      navigate(from, { replace: true });
    } else {
      navigate(getDefaultRedirect(role), { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      success(`Welcome back, ${loggedUser.name}!`);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoClick = async (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setLoading(true);
    setErrorMessage('');
    try {
      const loggedUser = await login(demo.email, demo.password);
      success(`Signed in as ${loggedUser.name} (${demo.badge})`);
      redirectAfterLogin(loggedUser.role);
    } catch (err) {
      const msg = err.message || 'Demo authentication failed.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyanAccent-400 mx-auto flex items-center justify-center text-white shadow-glow mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to Smart Campus Fix
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            AI-Driven Campus Issue Reporting & Operations Portal
          </p>
        </div>

        {/* 1-Click Demo Evaluation Cards */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-white shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Evaluation Fast-Access (1-Click Sign In)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.role + demo.email}
                type="button"
                onClick={() => handleQuickDemoClick(demo)}
                className="text-left p-2.5 rounded-xl bg-navy-900 border border-slate-700/80 hover:border-brand-400 hover:bg-navy-800 transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>{demo.title}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                    demo.role === 'admin' ? 'bg-purple-900/80 text-purple-200' :
                    demo.role === 'staff' ? 'bg-amber-900/80 text-amber-200' :
                    'bg-blue-900/80 text-blue-200'
                  }`}>
                    {demo.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{demo.badge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.student@campus.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
