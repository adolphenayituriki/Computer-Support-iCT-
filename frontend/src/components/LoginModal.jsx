import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const GOOGLE_CLIENT_ID = '418298227634-m4cokncs8hbadpdvis61ffvdbq6vcr8d.apps.googleusercontent.com';

export default function LoginModal({ onClose, onSwitchToRegister, onForgotPassword }) {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      showToast(`Welcome back, ${data.user.name}!`);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    setError('');
    try {
      const data = await googleLogin(credential);
      showToast(`Welcome, ${data.user.name}!`);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
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
    } catch (err) {
      setError('Google sign-in failed to initialize.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-card modal-auth">
      <div className="auth-logo">
        <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
        <small>COMPUTER SUPPORT</small>
      </div>
      <h2>Sign In</h2>
      <p className="auth-sub">Access your CS hub dashboard</p>
      <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={googleLoading}>
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
      <div id="google-login-btn" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}></div>
      <div className="auth-divider"><span>or</span></div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="email"
            placeholder="Email (eg,: adolphe@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="pwd-wrapper">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn" disabled={loading}>{loading ? <><span className="btn-spinner"></span> Signing In...</> : 'Sign In'}</button>
      </form>
      <p className="auth-footer">
        <button className="btn-link" onClick={onForgotPassword} style={{ fontSize: '0.8rem' }}>Forgot password?</button>
      </p>
      <p className="auth-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
        No account?{' '}
        <button className="btn-link" onClick={onSwitchToRegister}>Register here</button>
      </p>
    </div>
  );
}
