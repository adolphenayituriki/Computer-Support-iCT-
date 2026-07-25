import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import API_BASE from '../api';

export default function CertificateVerify() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const verifyCode = searchParams.get('code') || code;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!verifyCode) { setError('No verification code provided.'); setLoading(false); return; }
    setLoading(true);
    fetch(`${API_BASE}/api/enrollments/verify/${verifyCode}`)
      .then(r => {
        if (!r.ok) throw new Error('Certificate not found');
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [verifyCode]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <FaSpinner className="animate-spin" style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <FaExclamationCircle style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Invalid Certificate</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
            <FaArrowLeft /> Go to CS Hub
          </a>
        </div>
      </div>
    );
  }

  const catAbbr = { general: 'GN', hardware: 'HW', software: 'SW', network: 'NW', virus: 'VS', training: 'TR' };
  const year = data.completedAt ? new Date(data.completedAt).getFullYear() : new Date().getFullYear();
  const certNumber = `CSH-${catAbbr[data.courseCategory] || 'GN'}-${year}-${code}`;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
            <FaCheckCircle /> Verified Certificate
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Certificate of Completion</p>
            <h1 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>CS Hub (iCT)</h1>
            <p style={{ color: '#FCCF35', fontSize: '0.75rem', fontWeight: 600, margin: '0.25rem 0 0' }}>COMPUTER SUPPORT</p>
          </div>

          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>This certifies that</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FCCF35', margin: '0.25rem 0 0.75rem', fontFamily: "'Great Vibes', cursive" }}>{data.userName}</h2>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>has successfully completed the course</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0 1rem' }}>{data.courseTitle}</h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Score</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCCF35' }}>{data.assessmentScore}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Category</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}>{data.courseCategory}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Difficulty</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}>{data.courseDifficulty}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Completed</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{new Date(data.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.6rem', color: '#94a3b8', margin: 0 }}>Certificate No.</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', margin: '0.1rem 0 0' }}>{certNumber}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.6rem', color: '#94a3b8', margin: 0 }}>Verification Code</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', margin: '0.1rem 0 0' }}>{data.verificationCode}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
            <FaArrowLeft /> Back to CS Hub
          </a>
        </div>
      </div>
    </div>
  );
}
