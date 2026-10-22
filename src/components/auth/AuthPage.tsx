import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { User } from '../../types/auth';
import { loginUser, registerUser, loginAsDemo } from '../../lib/auth';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onCancel }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      const res = await registerUser(name.trim(), email.trim(), password);
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } else {
      setIsLoading(true);
      const res = await loginUser(email.trim(), password);
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginAsDemo();
    setIsLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Unable to access demo account.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F1F1F6] flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-[#12121B] border border-[#232334] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">
        {/* Left Side: Brand & Value Story */}
        <div className="p-8 md:p-10 bg-gradient-to-br from-[#181829] to-[#101018] border-b md:border-b-0 md:border-r border-[#222234] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-950/40 border border-violet-400/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-xl text-white font-editorial">
                  Novelle
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 ml-2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-6 font-editorial leading-tight">
              Personal Reading Intelligence Platform
            </h1>
            <p className="text-xs md:text-sm text-[#A2A2BD] mt-2 leading-relaxed">
              Your books, manga, manhwa, webtoons, and web novels unified in one private, beautifully formatted vault.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-4 border-t border-[#232334]">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Unique Isolated Storage</h4>
                <p className="text-[11px] text-[#86869E]">
                  Your reading events, private notes, and libraries are encrypted and isolated per user.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Novelle Rewind & AI Bard</h4>
                <p className="text-[11px] text-[#86869E]">
                  Spotify-Wrapped annual recaps narrated from your real stats with Gemini AI.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">52-Week Contribution Heatmap</h4>
                <p className="text-[11px] text-[#86869E]">
                  DST-safe streak tracking and intensity mapping across the entire year.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#6A6A85] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>AniList live auto-sync + Open Library enabled</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-10 flex flex-col justify-between space-y-6 bg-[#13131D]">
          {/* Top Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex bg-[#1B1B29] p-1 rounded-xl border border-[#28283C] w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-[#8E8EA8] hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-[#8E8EA8] hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#8A8AA5] hover:text-white font-medium"
              >
                Close
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {isRegister ? 'Create your reader account' : 'Welcome back to Novelle'}
              </h3>
              <p className="text-xs text-[#8A8AA5] mt-0.5">
                {isRegister
                  ? 'Start your personal reading vault and tracking intelligence'
                  : 'Sign in to access your library, streaks, and annual Rewind'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                  Full Name / Reader Handle *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6E6E88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Thorne"
                    className="w-full bg-[#181825] border border-[#2C2C40] rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6E6E88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reader@novelle.app"
                  className="w-full bg-[#181825] border border-[#2C2C40] rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6E6E88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'At least 6 characters' : 'Enter your password'}
                  className="w-full bg-[#181825] border border-[#2C2C40] rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6E88] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6E6E88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#181825] border border-[#2C2C40] rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Reader Account' : 'Sign In to Novelle'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Option */}
          <div className="space-y-3 pt-3 border-t border-[#232334]">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#26263B]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono tracking-wider text-[#686882]">
                Instant Exploration
              </span>
              <div className="flex-grow border-t border-[#26263B]" />
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1B1B29] hover:bg-[#232338] border border-[#2F2F45] text-xs font-semibold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>1-Click Demo Account (Elena Vance)</span>
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-1.5 text-xs text-[#7F7F9E] hover:text-white text-center cursor-pointer"
              >
                Continue exploring as Guest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
