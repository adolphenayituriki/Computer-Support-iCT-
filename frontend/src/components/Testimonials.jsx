import { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaUser, FaTimes, FaCamera } from 'react-icons/fa';

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.7rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={22}
          style={{ cursor: onChange ? 'pointer' : 'default', color: star <= value ? '#FFCE08' : '#d1d5db' }}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );
}

function SubmitTestimonialModal({ open, onClose }) {
  const [form, setForm] = useState({ name: '', role: '', content: '', avatar: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setDone(true);
    } catch (_) {}
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{done ? 'Thank You!' : 'Share Your Testimonial'}</h3>
          <button className="ticket-action-btn" onClick={onClose}><FaTimes /></button>
        </div>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <FaQuoteLeft size={36} style={{ color: '#FFCE08', marginBottom: '1rem' }} />
            <p style={{ color: '#334155', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Your testimonial has been submitted!</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>It will be visible on the site after admin approval.</p>
            <button className="btn" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.7rem' }}>
              <input
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ flex: 1 }}
              />
              <input
                placeholder="Role (optional)"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.7rem' }}>
              <input
                placeholder="Avatar URL (optional)"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}><FaCamera /> or use avatar</span>
            </div>
            <label style={{ fontSize: '0.85rem', color: '#4b5563', display: 'block', marginBottom: '0.3rem' }}>Rating</label>
            <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            <textarea
              rows="4"
              placeholder="Your testimonial *"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? <><span className="btn-spinner"></span> Submitting...</> : 'Submit Testimonial'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then(setTestimonials)
      .catch(() => {});
  }, []);

  return (
    <>
      <section id="testimonials" className="testimonials section-reveal" style={{ background: '#f8fafc' }}>
        <div className="container">
          <h2 className="section-title">What People Say</h2>
          <p className="section-sub">Real testimonials from our community</p>
          {testimonials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <FaQuoteLeft size={32} style={{ marginBottom: '0.5rem', color: '#d1d5db' }} />
              <p>No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {testimonials.map((t) => (
                <div
                  key={t._id}
                  style={{
                    background: 'white', borderRadius: '12px', padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
                    position: 'relative',
                  }}
                >
                  <FaQuoteLeft size={18} style={{ color: '#FFCE08', opacity: 0.3, position: 'absolute', top: '1rem', right: '1rem' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFCE08', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                        {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong style={{ color: '#1e293b', display: 'block', fontSize: '0.95rem' }}>{t.name}</strong>
                      {t.role && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{t.role}</span>}
                    </div>
                  </div>
                  <StarRating value={t.rating} />
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn" onClick={() => setShowSubmit(true)}>
              <FaUser style={{ marginRight: '0.5rem' }} /> Add Your Testimonial
            </button>
          </div>
        </div>
      </section>
      <SubmitTestimonialModal open={showSubmit} onClose={() => setShowSubmit(false)} />
    </>
  );
}
