import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      const data = await register(form.name, form.email, form.password);
      showToast(`Welcome, ${data.user.name}! Account created successfully.`);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card modal-auth">
      <div className="auth-logo">
        <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
        <small>COMPUTER SUPPORT</small>
      </div>
      <h2>Create Account</h2>
      <p className="auth-sub">Join CS hub (iCT) — Tech support for everyone</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div className="pwd-wrapper">
          <input
            type={showPwd.password ? 'text' : 'password'}
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, password: !showPwd.password })}>
            {showPwd.password ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="pwd-wrapper">
          <input
            type={showPwd.confirm ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
          <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>
            {showPwd.confirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn">Create Account</button>
      </form>
      <p className="auth-footer">
        Already have an account?{' '}
        <button className="btn-link" onClick={onSwitchToLogin}>Sign in</button>
      </p>
    </div>
  );
}
