import { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaClock, FaWhatsapp } from 'react-icons/fa';
import { useToast } from '../ToastContext';
import { useLang } from '../LanguageContext';
import API_BASE from '../api';

export default function Contact() {
  const { showToast } = useToast();
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = form;

    if (!name || !email || !message) {
      setFeedback({ text: t('contact.fillAll'), error: true });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        setForm({ name: '', email: '', message: '' });
        setFeedback(null);
      } else {
        setFeedback({ text: data.error || t('contact.error'), error: true });
      }
    } catch {
      setFeedback({ text: t('contact.networkError'), error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact section-reveal">
      <h2 className="section-title">{t('contact.title')}</h2>
      <p className="section-sub">{t('contact.subtitle')}</p>
      <div className="contact-grid">
        <div className="contact-form-col">
          <form onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder={t('contact.name')} value={form.name} onChange={handleChange} />
            <input name="email" type="email" placeholder={t('contact.email')} value={form.email} onChange={handleChange} />
            <textarea name="message" rows="3" placeholder={t('contact.message')} value={form.message} onChange={handleChange} />
            <button type="submit" className="btn" disabled={loading}>{loading ? <><span className="btn-spinner"></span> {t('contact.sending')}</> : t('contact.send')}</button>
          </form>
          {feedback && (
            <p className="form-feedback" style={{ color: feedback.error ? '#d32f2f' : '#2e7d32' }}>
              {feedback.text}
            </p>
          )}
        </div>

        <div className="contact-info-col">
          <h3>{t('contact.info')}</h3>

          <div className="contact-item">
            <span className="contact-icon"><FaMapMarkerAlt /></span>
            <div>
              <strong>{t('contact.location')}</strong>
              <p>{t('contact.locationVal')}</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><FaEnvelope /></span>
            <div>
              <strong>{t('contact.emailLabel')}</strong>
              <p>cshub.rw@gmail.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><FaPhoneAlt /></span>
            <div>
              <strong>{t('contact.phone')}</strong>
              <p>+250 78050 5948</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><FaClock /></span>
            <div>
              <strong>{t('contact.hours')}</strong>
              <p>{t('contact.hoursWeek')}<br />{t('contact.hoursSat')}</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon" style={{ color: '#25D366' }}><FaWhatsapp /></span>
            <div>
              <strong>{t('contact.whatsappGroup')}</strong>
              <p><a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>{t('contact.joinGroup')}</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
