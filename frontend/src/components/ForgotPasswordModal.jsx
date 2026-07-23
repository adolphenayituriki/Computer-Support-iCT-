import { useState, useEffect } from 'react';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API_BASE from '../api';

export default function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const { showToast } = useToast();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const requestToken = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoadingToken(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: 'success' });
        setStep('reset');
      } else {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch {
      setMessage({ text: 'No internet connection. Please check your network.', type: 'error' });
    } finally {
      setLoadingToken(false);
    }
  };

  const resendCode = async () => {
    setMessage({ text: '', type: '' });
    setLoadingResend(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: 'success' });
        setCooldown(30);
      } else {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch {
      setMessage({ text: 'No internet connection. Please check your network.', type: 'error' });
    } finally {
      setLoadingResend(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (newPwd.length < 6) {
      return setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
    }
    setLoadingReset(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password reset successfully! You can now sign in.');
        setTimeout(() => onBackToLogin(), 500);
      } else {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch {
      setMessage({ text: 'No internet connection. Please check your network.', type: 'error' });
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-7 text-center w-full">
      <div className="mb-2.5">
        <span className="text-blue-400">CS H</span><span className="text-slate-400">ub</span>{' '}
        <span className="text-slate-400 font-semibold">(</span><span className="text-slate-400">i</span><span className="text-blue-400">CT</span><span className="text-slate-400 font-semibold">)</span>
        <small className="block text-[0.6rem] font-semibold tracking-[0.5px] text-gray-500 mt-0.5">COMPUTER SUPPORT</small>
      </div>
      <h2 className="text-xl text-[#1e1b4b] mb-0.5">Reset Password</h2>

      {step === 'email' ? (
        <form onSubmit={requestToken} className="flex flex-col gap-2.5">
          <p className="text-sm text-gray-500 mb-4 text-center">
            Enter your email and we'll give you a reset code.
          </p>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFCE08] focus:ring-3 focus:ring-[rgba(255,206,8,0.15)]"
          />
          {message.text && (
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingToken}
          >
            {loadingToken ? <><span className="btn-spinner"></span> Sending...</> : 'Get Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="flex flex-col gap-2.5">
          <p className="text-sm text-gray-500 mb-4 text-center">
            A reset code was generated for <strong>{email}</strong>. Use it below.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Reset code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="flex-1 min-w-0 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFCE08] focus:ring-3 focus:ring-[rgba(255,206,8,0.15)]"
            />
            <div className="pwd-wrapper flex-1 min-w-0">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="New password (min 6 chars)"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#FFCE08] focus:ring-3 focus:ring-[rgba(255,206,8,0.15)]"
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {message.text && (
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingReset}
          >
            {loadingReset ? <><span className="btn-spinner"></span> Resetting...</> : 'Reset Password'}
          </button>
          <p className="text-[0.82rem] text-gray-500 m-0">
            Didn't get the code?{' '}
            <button
              type="button"
              className="text-[0.82rem] text-blue-500 cursor-pointer bg-transparent border-none font-inherit font-semibold p-0 hover:text-blue-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={loadingResend || cooldown > 0}
              onClick={resendCode}
            >
              {loadingResend ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </p>
        </form>
      )}

      <p className="mt-3 text-gray-500 text-sm">
        <button className="text-[0.85rem] text-[#FFCE08] cursor-pointer bg-transparent border-none font-inherit font-semibold p-0 hover:text-[#e6b800] hover:underline" onClick={onBackToLogin}>
          Back to Sign In
        </button>
      </p>
    </div>
  );
}
