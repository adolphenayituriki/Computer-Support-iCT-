import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher, FaTimes } from 'react-icons/fa';

export default function AILearningAuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select your role.'); return; }
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      localStorage.setItem('cshub_ai_role', role);
      showToast(`Welcome back, ${data.user.name}!`);
      onClose();
      navigate('/ai-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select your role.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      localStorage.setItem('cshub_ai_role', role);
      showToast(`Welcome, ${data.user.name}! Account created.`);
      onClose();
      navigate('/ai-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-auth-overlay" onClick={onClose}>
      <div className="ai-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ai-auth-close" onClick={onClose}><FaTimes /></button>

        <div className="ai-auth-logo">
          <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
          <small>COMPUTER SUPPORT</small>
        </div>

        <h2>AI Learning Platform</h2>
        <p className="ai-auth-sub">Join as a Student or Teacher to start learning</p>

        {/* Role Selection */}
        <div className="ai-auth-roles">
          <button className={`ai-auth-role${role === 'student' ? ' selected' : ''}`} onClick={() => setRole('student')}>
            <FaUserGraduate size={28} />
            <strong>Student</strong>
            <span>Learn with AI-powered tools</span>
          </button>
          <button className={`ai-auth-role${role === 'teacher' ? ' selected' : ''}`} onClick={() => setRole('teacher')}>
            <FaChalkboardTeacher size={28} />
            <strong>Teacher</strong>
            <span>Create lessons & manage classes</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="ai-auth-tabs">
          <button className={`ai-auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`ai-auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Sign Up</button>
        </div>

        {error && <p className="ai-auth-error">{error}</p>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="pwd-wrapper">
              <input
                type={showPwd.password ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, password: !showPwd.password })}>
                {showPwd.password ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className="ai-auth-submit" disabled={loading || !role}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email address"
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
            <button type="submit" className="ai-auth-submit" disabled={loading || !role}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="ai-auth-footer">
          {tab === 'login' ? (
            <>No account? <button onClick={() => { setTab('register'); setError(''); }}>Register here</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setTab('login'); setError(''); }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
