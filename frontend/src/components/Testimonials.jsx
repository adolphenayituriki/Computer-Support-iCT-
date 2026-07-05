import { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaUser, FaTimes, FaCamera } from 'react-icons/fa';

function StarRating({ value, onChange }) {
  return (
    <div className={`star-rating${onChange ? ' star-rating-interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={onChange ? 22 : 14}
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
      <div className="modal-content modal-auth" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{done ? 'Thank You!' : 'Share Your Testimonial'}</h2>
          <button type="button" className="ticket-action-btn" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <FaQuoteLeft size={36} style={{ color: '#FFCE08', marginBottom: '1rem' }} />
            <p style={{ color: '#334155', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Your testimonial has been submitted!</p>
            <p className="auth-sub">It will be visible on the site after admin approval.</p>
            <button type="button" className="btn" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-auth">
            <div className="form-row">
              <input
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Role (optional)"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                placeholder="Avatar URL (optional)"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}><FaCamera /> optional</span>
            </div>
            <label style={{ fontSize: '0.85rem', color: '#4b5563', display: 'block', textAlign: 'left' }}>Rating</label>
            <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            <textarea
              rows="4"
              placeholder="Tell us about your experience..."
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
      <section id="testimonials" className="testimonials section-reveal section-alt">
        <div className="container">
          <h2 className="section-title">What People Say</h2>
          <p className="section-sub">Real stories from people we&apos;ve helped along the way</p>
          {testimonials.length === 0 ? (
            <div className="testimonials-empty">
              <FaQuoteLeft size={32} style={{ marginBottom: '0.75rem', color: '#d1d5db' }} />
              <p>No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="testimonial-grid">
              {testimonials.map((t) => (
                <article key={t._id} className="testimonial-card">
                  <FaQuoteLeft size={18} className="testimonial-quote-icon" />
                  <div className="testimonial-author">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                    ) : (
                      <div className="testimonial-avatar-fallback">
                        {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong className="testimonial-name">{t.name}</strong>
                      {t.role && <span className="testimonial-role">{t.role}</span>}
                    </div>
                  </div>
                  <StarRating value={t.rating} />
                  <p className="testimonial-text">&ldquo;{t.content}&rdquo;</p>
                </article>
              ))}
            </div>
          )}
          <div className="testimonials-cta">
            <button type="button" className="btn" onClick={() => setShowSubmit(true)}>
              <FaUser style={{ marginRight: '0.5rem' }} /> Share Your Story
            </button>
          </div>
        </div>
      </section>
      <SubmitTestimonialModal open={showSubmit} onClose={() => setShowSubmit(false)} />
    </>
  );
}
