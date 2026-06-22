import { useState } from 'react';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const { showToast } = useToast();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const requestToken = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setMessage({ text: data.message, type: 'success' });
        setStep('reset');
      } else {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch {
      setMessage({ text: 'Could not reach the server.', type: 'error' });
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (newPwd.length < 6) {
      return setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
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
      setMessage({ text: 'Could not reach the server.', type: 'error' });
    }
  };

  return (
    <div className="auth-card modal-auth">
      <div className="auth-logo">
        <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
        <small>COMPUTER SUPPORT</small>
      </div>
      <h2>Reset Password</h2>

      {step === 'email' ? (
        <form onSubmit={requestToken}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center' }}>
            Enter your email and we'll give you a reset code.
          </p>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {message.text && <p className={`auth-error ${message.type === 'success' ? 'auth-success' : ''}`}>{message.text}</p>}
          <button type="submit" className="btn">Get Reset Code</button>
        </form>
      ) : (
        <form onSubmit={resetPassword}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center' }}>
            A reset code was generated for <strong>{email}</strong>. Use it below.
          </p>
          <input
            type="text"
            placeholder="Reset code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <div className="pwd-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="New password (min 6 chars)"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {message.text && <p className={`auth-error ${message.type === 'success' ? 'auth-success' : ''}`}>{message.text}</p>}
          <button type="submit" className="btn">Reset Password</button>
        </form>
      )}

      <p className="auth-footer">
        <button className="btn-link" onClick={onBackToLogin}>Back to Sign In</button>
      </p>
    </div>
  );
}
