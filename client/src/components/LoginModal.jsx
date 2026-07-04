import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginModal({ onClose, onSwitchToRegister, onForgotPassword }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="auth-card modal-auth">
      <div className="auth-logo">
        <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
        <small>COMPUTER SUPPORT</small>
      </div>
      <h2>Sign In</h2>
      <p className="auth-sub">Access your CS hub dashboard</p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="email"
            placeholder="Email"
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
      <p className="auth-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
        No account?{' '}
        <button className="btn-link" onClick={onSwitchToRegister}>Register here</button>
      </p>
    </div>
  );
}
