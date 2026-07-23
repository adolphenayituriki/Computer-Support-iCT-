import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

const GOOGLE_CLIENT_ID = '418298227634-m4cokncs8hbadpdvis61ffvdbq6vcr8d.apps.googleusercontent.com';

const FRIENDLY_ERRORS = {
  'Server error.': 'We\'re having trouble signing you in right now. Please try again in a few minutes.',
  'Invalid credentials.': 'The email or password you entered is incorrect.',
  'Email and password are required.': 'Please fill in both email and password.',
  'Google token is required.': 'Google sign-in was cancelled.',
  'Google authentication failed. Please try again.': 'Google sign-in failed. Please try again.',
  'Cannot reach server. Make sure the backend is running on port 3001.': 'No internet connection. Please check your network and try again.',
  'Server returned an empty response. Is the backend running?': 'We\'re having trouble connecting. Please try again.',
};

function mapError(msg) {
  return FRIENDLY_ERRORS[msg] || msg || 'Something went wrong. Please try again.';
}

function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required.';
  return '';
}

export default function LoginModal({ onClose, onSwitchToRegister, onForgotPassword, message }) {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    setFieldErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      setSuccess(true);
      showToast(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(mapError(err.message));
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    setError('');
    try {
      const data = await googleLogin(credential);
      setSuccess(true);
      showToast(`Welcome, ${data.user.name}!`);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(mapError(err.message || 'Google sign-in failed.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogle = () => {
    setError('');
    setGoogleLoading(true);
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => handleGoogleCredential(response.credential),
        auto_select: false,
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-login-btn'),
            { theme: 'outline', size: 'large', width: 300, text: 'continue_with' }
          );
          setGoogleLoading(false);
        }
      });
    } catch {
      setError('Google sign-in failed to initialize.');
      setGoogleLoading(false);
    }
  };

  const clearFieldError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setError('');
  };

  if (success) {
    return (
      <div className="auth-card modal-auth">
        <div className="auth-success">
          <div className="auth-success-icon">&#10003;</div>
          <h2>Welcome back!</h2>
          <p className="auth-sub">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card modal-auth relative" style={{ padding: message ? '2rem 1.5rem 1.5rem' : '1.5rem' }}>
      {message && (
        <div className="absolute top-0 left-0 right-0 rounded-t-lg bg-emerald-500 px-4 py-2 text-center z-10 shadow-sm">
          <p className="text-xs font-bold text-white">{message}</p>
        </div>
      )}
      <div className={message ? 'pt-8' : ''}>
      <div className="auth-logo" style={{ marginBottom: '0.3rem' }}>
        <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
      </div>
      <h2 style={{ marginBottom: '0.15rem' }}>Sign In</h2>
      <p className="auth-sub" style={{ marginBottom: '0.75rem', fontSize: '0.78rem' }}>Access your CS hub dashboard</p>
      <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={googleLoading || loading} style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
      <div id="google-login-btn" style={{ display: 'none' }}></div>
      <div className="auth-divider" style={{ margin: '0.4rem 0' }}><span>or</span></div>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>Email</label>
            <div className={`form-row ${fieldErrors.email ? 'has-error' : ''}`}>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError('email'); }}
                autoComplete="email"
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
              />
            </div>
            {fieldErrors.email && <span className="form-field-error"><FaExclamationCircle /> {fieldErrors.email}</span>}
          </div>
          <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>Password</label>
            <div className={`form-row ${fieldErrors.password ? 'has-error' : ''}`}>
              <div className="pwd-wrapper">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); clearFieldError('password'); }}
                  autoComplete="current-password"
                  style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {fieldErrors.password && <span className="form-field-error"><FaExclamationCircle /> {fieldErrors.password}</span>}
          </div>
        </div>
        {error && <p className="auth-error" style={{ marginBottom: '0.5rem' }}>{error}</p>}
        <button type="submit" className="btn" disabled={loading || googleLoading} style={{ padding: '0.6rem', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
          {loading ? <><span className="btn-spinner"></span> Signing in...</> : 'Sign In'}
        </button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
        <button className="btn-link" onClick={onForgotPassword} style={{ fontSize: '0.75rem' }}>Forgot password?</button>
        <span style={{ color: '#94a3b8' }}>No account? <button className="btn-link" onClick={onSwitchToRegister} style={{ fontSize: '0.75rem' }}>Register</button></span>
      </div>
      </div>
    </div>
  );
}
