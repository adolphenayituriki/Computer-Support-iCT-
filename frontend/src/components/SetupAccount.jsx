import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import API_BASE from '../api';

export default function SetupAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid setup link. Please check your email for the correct link.');
    }
  }, [email, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/setup-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name.trim(), password, token }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
      } else {
        setError(data.error || 'Something went wrong. Contact support.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '1.5rem' }}>
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '420px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffce08' }}>CS H</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 300, color: '#38bdf8' }}>ub</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 300, color: '#ffce08' }}> (iCT)</span>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '2px', marginTop: '4px' }}>COMPUTER SUPPORT</div>
        </div>
        <h2 style={{ color: '#f8fafc', textAlign: 'center', margin: '0 0 4px', fontSize: '1.3rem' }}>Set Up Your Account</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>Your application was approved! Create your password to get started.</p>
        {error && <p style={{ color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>Email</label>
            <input type="email" value={email} disabled style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#64748b', fontSize: '0.9rem', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
            <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>Password</label>
            <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>Confirm Password</label>
            <input type="password" placeholder="Repeat your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            {loading ? 'Setting up...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
