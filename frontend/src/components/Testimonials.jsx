import { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaUser, FaTimes, FaCamera } from 'react-icons/fa';
import { useLang } from '../LanguageContext';
import API_BASE from '../api';

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
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', role: '', content: '', avatar: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/testimonials`, {
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
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{done ? t('testimonials.thankYou') : t('testimonials.shareTitle')}</h2>
          <button type="button" className="ticket-action-btn" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>
        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <FaQuoteLeft size={36} style={{ color: '#FFCE08', marginBottom: '1rem' }} />
            <p style={{ color: '#334155', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t('testimonials.submitted')}</p>
            <p className="auth-sub">{t('testimonials.submittedSub')}</p>
            <button type="button" className="btn" onClick={onClose} style={{ marginTop: '1rem' }}>{t('testimonials.close')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-auth">
            <div className="form-row">
              <input placeholder={t('testimonials.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input placeholder={t('testimonials.role')} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input placeholder={t('testimonials.avatar')} value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} style={{ flex: 1 }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}><FaCamera /> {t('testimonials.optional')}</span>
            </div>
            <label style={{ fontSize: '0.85rem', color: '#4b5563', display: 'block', textAlign: 'left' }}>{t('testimonials.rating')}</label>
            <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            <textarea rows="4" placeholder={t('testimonials.experience')} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? <><span className="btn-spinner"></span> {t('testimonials.submitting')}</> : t('testimonials.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { t } = useLang();
  const [testimonials, setTestimonials] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`)
      .then((r) => r.json())
      .then(setTestimonials)
      .catch(() => {});
  }, []);

  return (
    <>
      <section id="testimonials" className="testimonials section-reveal section-alt">
        <div className="container">
          <h2 className="section-title">{t('testimonials.title')}</h2>
          <p className="section-sub">{t('testimonials.subtitle')}</p>
          {testimonials.length === 0 ? (
            <div className="testimonials-empty">
              <FaQuoteLeft size={32} style={{ marginBottom: '0.75rem', color: '#d1d5db' }} />
              <p>{t('testimonials.empty')}</p>
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
              <FaUser style={{ marginRight: '0.5rem' }} /> {t('testimonials.shareStory')}
            </button>
          </div>
        </div>
      </section>
      <SubmitTestimonialModal open={showSubmit} onClose={() => setShowSubmit(false)} />
    </>
  );
}
