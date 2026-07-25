import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import API_BASE from '../api';

function token() { return localStorage.getItem('cshub_token'); }

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const verified = useRef(false);

  useEffect(() => {
    const txRef = searchParams.get('tx_ref');
    if (!txRef || !token()) {
      setStatus('failed');
      return;
    }

    if (verified.current) return;
    verified.current = true;

    let attempts = 0;
    const maxAttempts = 15;

    const check = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setStatus('failed');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/payments/verify/${encodeURIComponent(txRef)}`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();
        if (data.status === 'successful') {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }
        setTimeout(check, 2000);
      } catch {
        setTimeout(check, 2000);
      }
    };

    check();
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {status === 'verifying' && (
          <>
            <FaSpinner className="animate-spin" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Verifying Payment...</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <FaCheckCircle style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Redirecting to dashboard...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <FaExclamationCircle style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Payment Issue</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>We could not verify your payment. Please check your dashboard.</p>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
