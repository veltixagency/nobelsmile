import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Shield, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, loginAsDemoAdmin, loginAsDemoPatient } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (mode === 'login') {
      if (!phone.trim()) {
        setErrorMsg('Please enter your mobile phone number (or email).');
        setIsSubmitting(false);
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password.');
        setIsSubmitting(false);
        return;
      }
      const res = await login(phone, password);
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed. Please check your mobile number and password.');
      }
    } else {
      // Patient Sign Up
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 8) {
        setErrorMsg('Please enter a valid mobile phone number (minimum 8-10 digits).');
        setIsSubmitting(false);
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg('Password should be at least 4 characters.');
        setIsSubmitting(false);
        return;
      }

      const res = await register(phone, password, fullName, email);
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      }
    }
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    onSuccess?.();
    onClose();
  };

  const handleDemoPatient = () => {
    loginAsDemoPatient();
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              {mode === 'login' ? <Phone className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'login' ? 'Patient Portal Sign In' : 'New Patient Registration'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {mode === 'login'
                  ? 'Access your dental visits & diagnostic reports'
                  : 'Register with mobile number & secure password'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-bold bg-slate-50">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In with Mobile
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up with Mobile
          </button>
        </div>

        {/* Informative Banner */}
        <div className="mx-6 mt-4 p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
          <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {mode === 'login'
              ? 'Enter your mobile number and password to view appointments and download your dental scan reports.'
              : 'Sign up with your mobile number to view consultations and download digital reports anytime.'}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                  required
                />
              </div>
            </div>
          )}

          {/* Mobile Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {mode === 'login' ? 'Mobile Phone Number (or Email)' : 'Mobile Phone Number'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type={mode === 'login' ? 'text' : 'tel'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={mode === 'login' ? 'e.g. 084012 33949 or patient@noblesmilestudio.com' : 'e.g. 084012 33949'}
                className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {mode === 'login' ? 'Password' : 'Create Password'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : mode === 'login' ? (
              <>
                Sign In with Mobile <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Create Account & Access Portal <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Instant 1-Click Access for Testing */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Quick 1-Click Patient & Admin Testing:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDemoPatient}
              className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
            >
              <div>
                <p className="text-[11px] font-bold text-blue-700">Demo Patient</p>
                <p className="text-[10px] text-slate-500 font-normal">Sameer Patel</p>
              </div>
              <User className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleDemoAdmin}
              className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-900">Medical Admin</p>
                <p className="text-[10px] text-slate-500 font-normal">Dr. Noman Shaikh</p>
              </div>
              <Shield className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
